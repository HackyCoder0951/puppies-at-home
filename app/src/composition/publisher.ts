import { revalidatePath, updateTag } from 'next/cache';
import type { ContentPublisher } from '@backend/modules/cms';
import { CACHE_TAGS } from './cached';

/** Expires the cached public reads right away (read-your-writes in server actions) and refreshes the site pages. */
export const contentPublisher: ContentPublisher = {
  async changed(scope) {
    updateTag(CACHE_TAGS[scope]);
    revalidatePath('/', 'layout');
  },
};
