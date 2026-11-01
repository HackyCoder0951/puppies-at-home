import { applyFilter, buildFacets, neighbours, type Puppy, type PuppyFilter } from '../domain';
import type { PuppyRepository } from './PuppyRepository';

export interface PuppyListing {
  readonly puppies: readonly Puppy[];
  readonly total: number;
  readonly facets: ReturnType<typeof buildFacets>;
  readonly goneHomePreview: readonly Puppy[];
}

export interface PuppyDetail {
  readonly puppy: Puppy;
  readonly prev: Puppy;
  readonly next: Puppy;
}

export const createCatalog = (repo: PuppyRepository) => ({
  async listPuppies(filter: PuppyFilter = {}): Promise<PuppyListing> {
    const [available, gone] = await Promise.all([repo.listAvailable(), repo.listGoneHome()]);
    return {
      puppies: applyFilter(available, filter),
      total: available.length,
      facets: buildFacets(available),
      goneHomePreview: gone.slice(0, 5),
    };
  },

  async listGoneHome(): Promise<readonly Puppy[]> {
    return repo.listGoneHome();
  },

  /** Detail for either status; previous and next wrap inside the puppy's own group. */
  async getPuppy(slug: string): Promise<PuppyDetail | undefined> {
    const [available, gone] = await Promise.all([repo.listAvailable(), repo.listGoneHome()]);
    for (const group of [available, gone]) {
      const index = group.findIndex((p) => p.slug === slug);
      const around = neighbours(group, index);
      if (around) return { puppy: group[index] as Puppy, ...around };
    }
    return undefined;
  },

  async listSlugs(): Promise<string[]> {
    const [a, g] = await Promise.all([repo.listAvailable(), repo.listGoneHome()]);
    return [...a, ...g].map((p) => p.slug);
  },
});

export type Catalog = ReturnType<typeof createCatalog>;
