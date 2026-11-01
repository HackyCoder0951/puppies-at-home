#!/usr/bin/env node
/**
 * Generates mock-data fixtures from the private research snapshot (docs/05-research/evidence/data-snapshot).
 * The snapshot is not committed; the generated fixtures are. Media files are copied from the reference into
 * public/media (decision D13 reversed by the owner: exact copy); fixtures reference them by path.
 *
 * Usage: node scripts/build-fixtures.mjs [snapshotDir]
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const snapshot = resolve(process.argv[2] ?? join(root, '../docs/05-research/evidence/data-snapshot'));
const read = (f) => JSON.parse(readFileSync(join(snapshot, f), 'utf8'));

const available = read('available.json');
const details = read('details.json');
const goneList = read('gone-list.json');
const families = read('families.json');
const faqs = read('faqs.json');
const settings = read('settings.json');
const testimonial = read('testimonial.json');

const sexOf = (label) => {
  const l = String(label).toLowerCase();
  if (l.includes('&')) return 'male-female';
  return l.startsWith('boy') || l === 'male' ? 'male' : 'female';
};

const posterUrl = (m) => (m.poster && typeof m.poster === 'object' ? m.poster.url : m.poster);

/** `src` is always a still image (the poster for videos); `videoSrc` is set for videos. Files live in public/media. */
const media = (m) => ({
  id: m.id,
  kind: m.kind,
  src: m.kind === 'video' ? posterUrl(m) : m.url,
  videoSrc: m.kind === 'video' ? m.url : undefined,
  width: m.width,
  height: m.height,
  alt: m.alt,
  caption: m.caption || undefined,
  color: m.color,
  focalX: m.focalX,
  focalY: m.focalY,
  durationS: m.durationS ?? undefined,
});

const dedupe = (list) => {
  const seen = new Set();
  return list.filter((m) => (seen.has(m.id) ? false : seen.add(m.id)));
};

const common = (slug) => {
  const d = details[slug];
  return {
    metaTitle: d.title,
    metaDescription: d.metaDescription,
    sectionTag: d.sectionTag || undefined,
    enquiryTitle: d.enquiryTitle,
    enquiryPrefill: d.enquiryPrefill,
    whatsappText: d.whatsappText,
    mediaRefs: d.media.map((m) => m.id),
  };
};

const puppies = [];

for (const a of available) {
  const d = details[a.slug];
  puppies.push({
    id: a.id,
    slug: a.slug,
    name: a.displayName,
    hasPersonalName: Boolean(a.name),
    breed: a.breed,
    sex: sexOf(a.genderLabel),
    age: a.age,
    colour: a.colour || undefined,
    where: d.facts.Where,
    origin: a.origin === 'local' ? 'local' : 'imported',
    collections: a.collections.map((c) => c.name),
    breeds: a.breeds.map((b) => b.name),
    status: 'available',
    coverId: a.cover.id,
    media: dedupe([a.cover, ...a.media, ...d.media]).map(media),
    ...common(a.slug),
  });
}

for (const g of goneList) {
  const d = details[g.slug];
  const nameIsBreed = d.name === d.facts.Breed || d.name === d.subtitle;
  puppies.push({
    id: g.slug,
    slug: g.slug,
    name: d.name,
    hasPersonalName: !nameIsBreed,
    breed: d.facts.Breed,
    sex: sexOf(d.facts['Boy or girl']),
    age: d.facts.Age,
    colour: d.facts.Colour || undefined,
    where: d.facts.Where,
    origin: d.facts.Where === 'In Dubai' ? 'local' : 'imported',
    collections: [],
    breeds: [d.facts.Breed],
    status: 'gone-home',
    source: g.source,
    coverId: d.media[0]?.id,
    media: dedupe(d.media).map(media),
    ...common(g.slug),
  });
}

const write = (rel, data) => {
  const out = join(root, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`wrote ${rel}`);
};

write('src/modules/catalog/infrastructure/mock/fixtures/puppies.json', puppies);
write('src/modules/content/infrastructure/mock/fixtures/families.json', families.map(media));
write('src/modules/content/infrastructure/mock/fixtures/faqs.json', faqs);
write('src/modules/content/infrastructure/mock/fixtures/settings.json', settings);
write('src/modules/content/infrastructure/mock/fixtures/testimonial.json', {
  quote: testimonial.quote,
  attribution: 'A happy TeddyPups family, Dubai, UAE',
});
