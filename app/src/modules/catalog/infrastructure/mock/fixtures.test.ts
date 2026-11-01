import { describe, expect, it } from 'vitest';
import { MockPuppyRepository } from './MockPuppyRepository';
import { createCatalog } from '../../application';
import { applyFilter, buildFacets, neighbours, SEX_LABEL } from '../../domain';

/** Completeness gate for the mock data (docs/02-architecture/23-mock-data-catalogue.md). */
const repo = new MockPuppyRepository();
const catalog = createCatalog(repo);

describe('catalog fixtures', () => {
  it('has 15 available, 27 gone-home and 42 detail pages', async () => {
    expect((await repo.listAvailable()).length).toBe(15);
    expect((await repo.listGoneHome()).length).toBe(27);
    expect((await catalog.listSlugs()).length).toBe(42);
  });
  it('has 132 media refs with 6 videos on 4 puppies', async () => {
    const all = [...(await repo.listAvailable()), ...(await repo.listGoneHome())];
    const media = all.flatMap((p) => p.media);
    expect(media.length).toBe(132);
    expect(media.filter((m) => m.kind === 'video').length).toBe(6);
    expect(all.filter((p) => p.media.some((m) => m.kind === 'video')).length).toBe(4);
  });
  it('keeps slugs unique and names the quirks', async () => {
    const all = [...(await repo.listAvailable()), ...(await repo.listGoneHome())];
    expect(new Set(all.map((p) => p.slug)).size).toBe(42);
    expect((await repo.listAvailable()).filter((p) => p.hasPersonalName).map((p) => p.name).sort()).toEqual(['Copper', 'Max']);
    expect((await repo.listGoneHome()).filter((p) => !p.hasPersonalName).length).toBe(3);
  });
  it('matches the sex and facet acceptance numbers', async () => {
    const av = await repo.listAvailable();
    expect(av.filter((p) => p.sex === 'male').length).toBe(5);
    expect(av.filter((p) => p.sex === 'female').length).toBe(9);
    expect(av.filter((p) => p.sex === 'male-female').length).toBe(1);
    expect(SEX_LABEL['male-female']).toBe('Boy & girl');
    const f = buildFacets(av);
    expect(Object.fromEntries(f.breeds.map((b) => [b.label, b.count]))).toEqual({ Maltipoo: 6, Pomeranian: 4, Poodle: 2, Cavapoo: 2, 'Shih Tzu': 2 });
    expect(f.where.find((w) => w.value === 'korean-teacup')?.count).toBe(5);
  });
});

describe('filters and neighbours', () => {
  it('filters by breed, collection and sex with AND between groups', async () => {
    const av = await repo.listAvailable();
    expect(applyFilter(av, { breeds: ['maltipoo'] }).length).toBe(6);
    expect(applyFilter(av, { collections: ['korean-teacup'] }).length).toBe(5);
    expect(applyFilter(av, { collections: ['korean-teacup'], breeds: ['shih-tzu'] }).length).toBe(0);
    expect(applyFilter(av, { origin: 'local' }).length).toBe(0);
  });
  it('wraps previous and next, matching the reference for Max', async () => {
    const detail = await catalog.getPuppy('maltipoo-max-male');
    expect(detail?.prev.name).toBe('Korean Teacup Pomeranian');
    expect(detail?.next.name).toBe('Korean Teacup Maltipoo');
    expect(neighbours([1, 2, 3], 0)).toEqual({ prev: 3, next: 2 });
    expect(neighbours([], 0)).toBeUndefined();
  });
  it('returns undefined for unknown slugs and a gone-home preview of five', async () => {
    expect(await catalog.getPuppy('nope')).toBeUndefined();
    expect((await catalog.listPuppies()).goneHomePreview.length).toBe(5);
  });
});
