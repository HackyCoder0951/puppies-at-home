import { describe, expect, it } from 'vitest';
import { createCms } from './cms';
import { RepositoryError, type CmsRepository, type NewMedia } from './ports';
import type { PuppyAdminDetail } from '../domain';

const png = new Uint8Array([1, 2, 3]);

function setup(opts: { slugs?: string[]; forbidden?: boolean; dims?: { width: number; height: number } | undefined } = {}) {
  const calls: string[] = [];
  const uploads: string[] = [];
  const created: { slug: string }[] = [];
  const media: NewMedia[] = [];
  const guard = () => { if (opts.forbidden) throw new RepositoryError('forbidden', 'denied'); };
  const detail: PuppyAdminDetail = { id: 'p1', slug: 'maltipoo-max-male', name: 'Max', breed: 'Maltipoo', sex: 'male', ageText: '3 months', origin: 'imported', status: 'available', publishedAt: null, coverUrl: null, deleted: false, breeds: [], collections: [], colour: null, priceAed: null, goneHomeSource: null, media: [] };
  const repo = {
    slugExists: async (s: string) => (opts.slugs ?? []).includes(s) || created.some((c) => c.slug === s),
    createPuppy: async (_i: unknown, slug: string) => (guard(), created.push({ slug }), { id: 'new' }),
    getPuppy: async () => detail,
    addMedia: async (_id: string, m: NewMedia) => void media.push(m),
    setPublished: async () => guard(),
  } as unknown as CmsRepository;
  const cms = createCms({
    repo,
    media: { upload: async (p) => void uploads.push(p), remove: async () => undefined },
    probe: { dimensions: async () => ('dims' in opts ? opts.dims : { width: 800, height: 600 }) },
    publisher: { changed: async (s) => void calls.push(s) },
    ids: { next: () => 'uuid' },
  });
  return { cms, calls, uploads, created, media };
}

const valid = { name: 'Max', breed: 'Maltipoo', sex: 'male', ageText: '3 months', origin: 'imported' };

describe('cms puppies', () => {
  it('creates a draft with a unique slug and tells the site', async () => {
    const { cms, created, calls } = setup({ slugs: ['maltipoo-max-male'] });
    const r = await cms.createPuppy(valid);
    expect(r).toEqual({ ok: true, value: { id: 'new' } });
    expect(created[0]?.slug).toBe('maltipoo-max-male-2');
    expect(calls).toEqual(['puppies']);
  });

  it('rejects invalid input naming the field and does not notify', async () => {
    const { cms, calls } = setup();
    expect(await cms.createPuppy({ ...valid, breed: '' })).toEqual({ ok: false, error: { code: 'invalid', field: 'breed' } });
    expect(await cms.createPuppy({ ...valid, priceAed: '-5' })).toMatchObject({ ok: false });
    expect(calls).toEqual([]);
  });

  it('maps a database refusal to forbidden and does not notify', async () => {
    const { cms, calls } = setup({ forbidden: true });
    expect(await cms.publishPuppy('p1', true)).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect(calls).toEqual([]);
  });
});

describe('cms media', () => {
  it('stores a valid photo under the puppy slug with probed dimensions', async () => {
    const { cms, uploads, media } = setup();
    const r = await cms.addPuppyMedia('p1', { bytes: png, contentType: 'image/png', alt: 'Max on the sofa' });
    expect(r.ok).toBe(true);
    expect(uploads).toEqual(['puppies/maltipoo-max-male/uuid.png']);
    expect(media[0]).toMatchObject({ kind: 'photo', width: 800, height: 600 });
  });

  it('rejects unsupported types, undecodable images, large files and missing descriptions', async () => {
    const { cms } = setup({ dims: undefined });
    expect(await cms.addPuppyMedia('p1', { bytes: png, contentType: 'application/pdf', alt: 'doc' })).toEqual({ ok: false, error: { code: 'unsupported-media' } });
    expect(await cms.addPuppyMedia('p1', { bytes: png, contentType: 'image/png', alt: 'fake image' })).toEqual({ ok: false, error: { code: 'unsupported-media' } });
    expect(await cms.addPuppyMedia('p1', { bytes: new Uint8Array(11 * 1024 * 1024), contentType: 'image/jpeg', alt: 'too big' })).toEqual({ ok: false, error: { code: 'too-large' } });
    expect(await cms.addPuppyMedia('p1', { bytes: png, contentType: 'image/png', alt: ' ' })).toEqual({ ok: false, error: { code: 'invalid', field: 'alt' } });
  });
});

describe('cms settings', () => {
  it('validates contact settings', async () => {
    const { cms } = setup();
    const bad = await cms.saveSettings({ whatsapp_number: '+97 15', whatsapp_text: 'hi there', phone_href: 'tel:+971500000000', email: 'a@b.co', address: 'Dubai', maps_href: 'https://maps.example/x', instagram: 'https://i.example', tiktok: 'https://t.example', facebook: 'https://f.example' });
    expect(bad).toEqual({ ok: false, error: { code: 'invalid', field: 'whatsapp_number' } });
  });
});
