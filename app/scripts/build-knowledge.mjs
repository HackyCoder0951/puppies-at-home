#!/usr/bin/env node
/**
 * Generates the assistant's knowledge files (docs/02-architecture/27 section 6) from the same public data the website shows:
 * the puppy and content fixtures (later, the published database content). Output is versioned and read-only at runtime.
 * The generator refuses to write files that contain prices, stray contact details or instruction-like text.
 *
 * Writes to src/modules/assistant/infrastructure/knowledge/<version>/. Usage: node scripts/build-knowledge.mjs [version]   (default v1; Node 24 reads the TypeScript copy file directly)
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const version = process.argv[2] ?? 'v1';
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const { howItWorksCopy: copy } = await import(join(root, 'src/modules/content/infrastructure/static/howItWorks.ts'));

const puppies = read('src/modules/catalog/infrastructure/mock/fixtures/puppies.json');
const faqs = read('src/modules/content/infrastructure/mock/fixtures/faqs.json');
const raw = read('src/modules/content/infrastructure/mock/fixtures/settings.json');

const SEX_WORD = { male: 'boy', female: 'girl', 'male-female': 'boy and girl (a pair)' };
const settings = {
  whatsappNumber: raw.whatsappNumber,
  whatsappUrl: `https://wa.me/${raw.whatsappNumber}`,
  contactFormUrl: '/contact',
  phoneDisplay: `+${raw.whatsappNumber.replace(/^(\d{3})(\d{2})(\d{3})(\d{4})$/, '$1 $2 $3 $4')}`,
  email: raw.email,
  address: raw.address,
  mapsUrl: raw.mapsHref,
  instagram: raw.instagram,
  tiktok: raw.tiktok,
};

const doc = (p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  hasPersonalName: p.hasPersonalName,
  breed: p.breed,
  breeds: p.breeds,
  sex: p.sex,
  age: p.age,
  ...(p.colour ? { colour: p.colour } : {}),
  where: p.where,
  origin: p.origin,
  collections: p.collections,
  status: p.status,
  reserved: Boolean(p.reserved),
  hasVideo: p.media.some((m) => m.kind === 'video'),
  pageUrl: `/puppies/${p.slug}`,
  text: [p.hasPersonalName ? p.name : null, p.breed, SEX_WORD[p.sex], p.age, p.colour, p.where, p.origin === 'local' ? 'in Dubai, can be visited' : 'imported on request', ...p.collections].filter(Boolean).join(', '),
});
const all = puppies.map(doc);

const info = [];
const add = (topic, title, text) => info.push({ id: `info-${info.length + 1}`, topic, title, text });
add('general', 'About TeddyPups', copy.intro);
for (const [key, way] of Object.entries(copy.ways)) {
  const topic = key === 'dubai' ? 'visit' : 'imports';
  way.paragraphs.forEach((t) => add(topic, way.heading, t));
  way.steps.forEach((s) => add('process', `${way.label}: ${s.title}`, s.text));
}
copy.promise.forEach((s) => add('general', s.title, s.text));
add('delivery', 'Delivery and collection', copy.deliveryIntro);
copy.delivery.forEach((s) => add('delivery', s.title, s.text));
copy.whyUs.forEach((s) => add(/health/i.test(s.title) ? 'health' : /cargo/i.test(s.title) ? 'delivery' : 'general', s.title, s.text));
add('general', copy.closing.title, copy.closing.text);

const files = {
  'puppies.json': all.filter((p) => p.status === 'available'),
  'gone-home.json': all.filter((p) => p.status === 'gone-home'),
  'faqs.json': faqs.map((f, i) => ({ id: `faq-${i + 1}`, question: f.question, answer: f.answer })),
  'info.json': info,
  'settings.json': settings,
};

// Generator checks: nothing the assistant must never say may enter the files.
const businessContact = [settings.email, settings.phoneDisplay, settings.whatsappNumber];
const problems = [];
for (const [name, data] of Object.entries(files)) {
  const text = JSON.stringify(data);
  if (name !== 'settings.json') {
    if (/\b(AED|USD|EUR|dhs?)\b\s?\d|\d\s?(AED|USD|dhs?)\b|[$€£]\s?\d/i.test(text)) problems.push(`${name}: contains a price`);
    for (const m of text.match(/[\w.+-]+@[\w-]+\.[\w.]+|\+?\d[\d\s-]{8,}\d/g) ?? []) if (!businessContact.some((c) => m.replace(/\s|-/g, '').includes(String(c).replace(/\D/g, '')) || String(c).includes(m))) problems.push(`${name}: stray contact detail "${m}"`);
  }
  if (/ignore (all |any )?(previous|prior|above)|system prompt|you are now|disregard/i.test(text)) problems.push(`${name}: instruction-like text`);
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

const dir = join(root, 'src/modules/assistant/infrastructure/knowledge', version);
mkdirSync(dir, { recursive: true });
const sha = {};
for (const [name, data] of Object.entries(files)) {
  const body = `${JSON.stringify(data, null, 2)}\n`;
  writeFileSync(join(dir, name), body);
  sha[name] = createHash('sha256').update(body).digest('hex');
}
const manifest = { version, source: 'mock', counts: { puppies: files['puppies.json'].length, goneHome: files['gone-home.json'].length, faqs: files['faqs.json'].length, info: info.length }, sha256: sha };
writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`knowledge ${version}:`, JSON.stringify(manifest.counts));
