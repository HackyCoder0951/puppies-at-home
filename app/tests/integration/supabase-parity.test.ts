import { describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { SupabaseContentRepository, SupabasePuppyRepository } from '@backend/adapters';
import { MockContentRepository } from '@modules/content/infrastructure';
import { MockPuppyRepository } from '@modules/catalog/infrastructure';
import { howItWorksCopy } from '@modules/content/infrastructure/static/howItWorks';

/**
 * Opt-in (needs the seeded local stack): SUPABASE_URL, SUPABASE_ANON_KEY. Proves the Supabase adapters return the
 * same domain data as the mock fixtures, apart from ids and the media base URL.
 */
const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const run = url && anon ? describe : describe.skip;

const strip = (value: unknown): unknown =>
  JSON.parse(
    JSON.stringify(value, (key, v) => (['id', 'coverId', 'mediaRefs'].includes(key) ? undefined : typeof v === 'string' ? v.replace(/^.*\/site-media\//, '/media/') : v)),
  );

run('supabase adapters match the mock fixtures', () => {
  const client = createClient(url ?? 'http://x', anon ?? 'x', { auth: { persistSession: false } });
  const base = `${url}/storage/v1/object/public/site-media`;
  const puppies = new SupabasePuppyRepository(client, base);
  const content = new SupabaseContentRepository(client, base, howItWorksCopy);

  it('available puppies', async () => {
    expect(strip(await puppies.listAvailable())).toEqual(strip(await new MockPuppyRepository().listAvailable()));
  });
  it('gone-home puppies', async () => {
    expect(strip(await puppies.listGoneHome())).toEqual(strip(await new MockPuppyRepository().listGoneHome()));
  });
  it('content', async () => {
    const mock = new MockContentRepository();
    expect(await content.settings()).toEqual(await mock.settings());
    expect(await content.faqs()).toEqual(await mock.faqs());
    const pick = (photos: readonly { src: string; width: number; height: number; alt: string; caption?: string; color: string }[]) =>
      photos.map(({ src, width, height, alt, caption, color }) => ({ src, width, height, alt, caption, color }));
    expect(strip(pick(await content.familyPhotos()))).toEqual(strip(pick(await mock.familyPhotos())));
    expect(await content.testimonial()).toEqual(await mock.testimonial());
  });
});
