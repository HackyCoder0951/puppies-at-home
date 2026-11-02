import { unstable_cache } from 'next/cache';
import type { PuppyRepository } from '@modules/catalog/application';
import type { ContentRepository } from '@modules/content/application';

/** Cache tags; the admin revalidates these on publish (B4). */
export const CACHE_TAGS = { puppies: 'puppies', content: 'content' } as const;
const REVALIDATE_SECONDS = 60;

const wrap = <T>(key: string, tag: string, load: () => Promise<T>): (() => Promise<T>) =>
  unstable_cache(load, [key], { tags: [tag], revalidate: REVALIDATE_SECONDS });

export function cachePuppies(repo: PuppyRepository): PuppyRepository {
  const available = wrap('puppies:available', CACHE_TAGS.puppies, () => repo.listAvailable());
  const goneHome = wrap('puppies:gone-home', CACHE_TAGS.puppies, () => repo.listGoneHome());
  return { listAvailable: available, listGoneHome: goneHome };
}

export function cacheContent(repo: ContentRepository): ContentRepository {
  return {
    settings: wrap('content:settings', CACHE_TAGS.content, () => repo.settings()),
    faqs: wrap('content:faqs', CACHE_TAGS.content, () => repo.faqs()),
    familyPhotos: wrap('content:families', CACHE_TAGS.content, () => repo.familyPhotos()),
    testimonial: wrap('content:testimonial', CACHE_TAGS.content, () => repo.testimonial()),
    howItWorks: wrap('content:how', CACHE_TAGS.content, () => repo.howItWorks()),
  };
}
