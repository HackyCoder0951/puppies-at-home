import { createCatalog, type Catalog } from '@modules/catalog/application';
import { MockPuppyRepository } from '@modules/catalog/infrastructure';
import { createContent, type Content } from '@modules/content/application';
import { MockContentRepository } from '@modules/content/infrastructure';
import { getEnv } from '@shared/config';

export interface Container {
  readonly catalog: Catalog;
  readonly content: Content;
}

let cached: Container | undefined;

/** Composition root: the only place that picks adapters (DATA_SOURCE=mock|supabase). */
export function getContainer(): Container {
  if (cached) return cached;
  const source = getEnv().DATA_SOURCE;
  if (source !== 'mock') throw new Error(`DATA_SOURCE "${source}" has no adapter yet; the frontend track uses mock data.`);
  cached = { catalog: createCatalog(new MockPuppyRepository()), content: createContent(new MockContentRepository()) };
  return cached;
}

export function resetContainer(): void {
  cached = undefined;
}
