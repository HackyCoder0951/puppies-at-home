#!/usr/bin/env node
/**
 * Seeds the database and the site-media bucket from the committed frontend fixtures (local and staging only).
 * Idempotent: upserts by slug, replaces media rows, uploads with upsert.
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (npm run db:seed reads them from `supabase status`).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const fixtures = join(root, 'app/src/modules');
const media = join(root, 'app/public');
const read = (p) => JSON.parse(readFileSync(join(fixtures, p), 'utf8'));

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
const db = createClient(url, key, { auth: { persistSession: false } });

const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif', mp4: 'video/mp4', webm: 'video/webm' };
const uploaded = new Set();
const pathOf = (src) => src.replace(/^\/media\//, '');

async function upload(src) {
  const path = pathOf(src);
  if (uploaded.has(path)) return path;
  const file = join(media, 'media', path);
  if (!existsSync(file)) throw new Error(`missing media file ${file}`);
  const ext = path.split('.').pop().toLowerCase();
  // Retried: uploads over the internet fail now and then ("fetch failed"); the call is idempotent (upsert).
  let error;
  for (let attempt = 1; attempt <= 4; attempt++) {
    ({ error } = await db.storage.from('site-media').upload(path, readFileSync(file), { contentType: MIME[ext], upsert: true }).catch((e) => ({ error: e })));
    if (!error) break;
    await new Promise((r) => setTimeout(r, attempt * 1500));
  }
  if (error) throw new Error(`upload ${path}: ${error.message}`);
  uploaded.add(path);
  return path;
}
const check = (label, { error }) => { if (error) throw new Error(`${label}: ${error.message}`); };
const now = new Date().toISOString();

async function seedPuppies() {
  const puppies = read('catalog/infrastructure/mock/fixtures/puppies.json');
  let order = 0;
  for (const p of puppies) {
    const gone = p.status === 'gone-home';
    const row = {
      slug: p.slug, name: p.hasPersonalName ? p.name : null, breed: p.breed, breeds: p.breeds, collections: p.collections,
      sex: p.sex, age_text: p.age, colour: p.colour ?? null, origin: p.origin, status: gone ? 'gone_home' : 'available',
      gone_home_source: gone ? (p.source ?? 'TeddyPups') : null, sort_order: order++, published_at: now,
      gone_home_at: gone ? new Date(Date.now() - order * 86400000).toISOString() : null,
    };
    const { data, error } = await db.from('puppies').upsert(row, { onConflict: 'slug' }).select('id').single();
    check(`puppy ${p.slug}`, { error });
    check('clear media', await db.from('puppy_media').delete().eq('puppy_id', data.id));
    const rows = [];
    let i = 0;
    for (const m of p.media) {
      const video = m.kind === 'video';
      rows.push({
        puppy_id: data.id, kind: video ? 'video' : 'photo',
        storage_path: await upload(video ? m.videoSrc : m.src), poster_path: video ? await upload(m.src) : null,
        alt: m.alt, caption: m.caption ?? null, color: m.color, focal_x: m.focalX ?? 0.5, focal_y: m.focalY ?? 0.5,
        width: m.width, height: m.height, duration_s: m.durationS ?? null, sort_order: i++, is_cover: m.id === p.coverId,
      });
    }
    if (rows.length) check(`media ${p.slug}`, await db.from('puppy_media').insert(rows));
  }
  return puppies.length;
}

async function seedContent() {
  const faqs = read('content/infrastructure/mock/fixtures/faqs.json');
  check('clear faqs', await db.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
  check('faqs', await db.from('faqs').insert(faqs.map((f, i) => ({ question: f.question, answer: f.answer, sort_order: i, published_at: now }))));
  const families = read('content/infrastructure/mock/fixtures/families.json');
  check('clear families', await db.from('families').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
  const famRows = [];
  for (const [i, f] of families.entries()) {
    famRows.push({ storage_path: await upload(f.src), alt: f.alt, caption: f.caption ?? null, color: f.color, width: f.width, height: f.height, sort_order: i, release_ref: 'mock-seed', published_at: now });
  }
  check('families', await db.from('families').insert(famRows));
  const t = read('content/infrastructure/mock/fixtures/testimonial.json');
  const [author, ...rest] = t.attribution.split(', ');
  check('clear testimonials', await db.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
  check('testimonial', await db.from('testimonials').insert({ quote: t.quote, author, location: rest.join(', ') || null, is_featured: true, published_at: now }));
  return { faqs: faqs.length, families: families.length };
}

/** Public contact settings (phone, WhatsApp, email, social links) from the committed seed file; safe to repeat. */
async function seedSettings() {
  const sql = readFileSync(join(root, 'backend/supabase/seed.sql'), 'utf8');
  const rows = [...sql.matchAll(/\('([a-z_]+)', '"((?:[^"']|'')*)"', true\)/g)].map((m) => ({ key: m[1], value: m[2].replace(/''/g, "'"), is_public: true }));
  check('settings', await db.from('site_settings').upsert(rows, { onConflict: 'key' }));
  return rows.length;
}

const puppies = await seedPuppies();
await seedSettings();
const content = await seedContent();
console.log(`seeded ${puppies} puppies, ${content.faqs} faqs, ${content.families} family photos, ${uploaded.size} media files`);
