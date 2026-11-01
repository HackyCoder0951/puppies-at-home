import type { Puppy, Sex } from './Puppy';

export interface PuppyFilter {
  readonly origin?: 'local' | 'imported';
  readonly collections?: readonly string[];
  /** Breed slugs, for example "shih-tzu". */
  readonly breeds?: readonly string[];
  readonly sexes?: readonly Exclude<Sex, 'male-female'>[];
}

export const slugify = (s: string): string =>
  s.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const isEmptyFilter = (f: PuppyFilter): boolean =>
  !f.origin && !f.collections?.length && !f.breeds?.length && !f.sexes?.length;

/**
 * Filter semantics (assumed from the reference, gaps G1 to G3): groups combine with AND, values inside a
 * group combine with OR; a "male-female" pair matches both Boy and Girl; an origin with no puppies yields an empty list.
 */
export function matchesFilter(p: Puppy, f: PuppyFilter): boolean {
  if (f.origin && p.origin !== f.origin) return false;
  if (f.collections?.length && !f.collections.some((c) => p.collections.map(slugify).includes(c))) return false;
  if (f.breeds?.length && !f.breeds.some((b) => p.breeds.map(slugify).includes(b))) return false;
  if (f.sexes?.length && !f.sexes.some((s) => p.sex === s || p.sex === 'male-female')) return false;
  return true;
}

export const applyFilter = (list: readonly Puppy[], f: PuppyFilter): Puppy[] => list.filter((p) => matchesFilter(p, f));

export interface FacetOption {
  readonly value: string;
  readonly label: string;
  readonly count: number;
}

/** Facet chips derived from the available puppies: 5 breeds, 2 sexes, origin and collection. */
export function buildFacets(available: readonly Puppy[]) {
  const breeds = new Map<string, FacetOption>();
  for (const p of available) {
    for (const b of p.breeds) {
      const v = slugify(b);
      breeds.set(v, { value: v, label: b, count: (breeds.get(v)?.count ?? 0) + 1 });
    }
  }
  const count = (fn: (p: Puppy) => boolean) => available.filter(fn).length;
  return {
    where: [
      { value: 'imported', label: 'Imported', count: count((p) => p.origin === 'imported') },
      { value: 'korean-teacup', label: 'Korean Teacup', count: count((p) => p.collections.includes('Korean Teacup')) },
    ] satisfies FacetOption[],
    breeds: [...breeds.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    sexes: [
      { value: 'male', label: 'Boys', count: count((p) => p.sex === 'male') },
      { value: 'female', label: 'Girls', count: count((p) => p.sex === 'female') },
    ] satisfies FacetOption[],
  };
}

type Raw = Record<string, string | string[] | undefined>;
const many = (v: string | string[] | undefined): string[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

/** Parses URL search params into a filter; unknown values are ignored so bad links never break the page. */
export function parseFilter(raw: Raw): PuppyFilter {
  const origin = many(raw.origin)[0];
  const sexes = many(raw.sex).filter((s): s is 'male' | 'female' => s === 'male' || s === 'female');
  return {
    origin: origin === 'local' || origin === 'imported' ? origin : undefined,
    collections: many(raw.collection).map(slugify).filter(Boolean),
    breeds: many(raw.breed).map(slugify).filter(Boolean),
    sexes,
  };
}

export type FilterGroup = 'origin' | 'collections' | 'breeds' | 'sexes';

/** Returns the filter with `value` toggled in `group`; origin is single-select. */
export function toggleFilter(f: PuppyFilter, group: FilterGroup, value: string): PuppyFilter {
  if (group === 'origin') return { ...f, origin: f.origin === value ? undefined : (value as 'local' | 'imported') };
  const current = (f[group] ?? []) as readonly string[];
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  return { ...f, [group]: next };
}

export const isSelected = (f: PuppyFilter, group: FilterGroup, value: string): boolean =>
  group === 'origin' ? f.origin === value : ((f[group] ?? []) as readonly string[]).includes(value);
