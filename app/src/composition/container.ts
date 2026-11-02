import { createCatalog, type Catalog, type PuppyRepository } from '@modules/catalog/application';
import { MockPuppyRepository } from '@modules/catalog/infrastructure';
import { createEnquiryService, type EnquiryService, type EnquiryStore, type RateLimiter } from '@modules/crm/application';
import { InMemoryEnquiryStore, InMemoryRateLimiter } from '@modules/crm/infrastructure';
import { createContent, type Content, type ContentRepository } from '@modules/content/application';
import { MockContentRepository } from '@modules/content/infrastructure';
import { howItWorksCopy } from '@modules/content/infrastructure/static/howItWorks';
import { PlatformRateLimiter, SupabaseContentRepository, SupabaseEnquiryStore, SupabasePuppyRepository } from '@backend/adapters';
import { createPublicClient } from '@platform';
import { getEnv } from '@shared/config';
import { cacheContent, cachePuppies } from './cached';

export interface Container {
  readonly catalog: Catalog;
  readonly content: Content;
  readonly enquiries: EnquiryService;
}

interface Adapters {
  puppies: PuppyRepository;
  content: ContentRepository;
  store: EnquiryStore;
  limiter: RateLimiter;
}

function mockAdapters(): Adapters {
  return {
    puppies: new MockPuppyRepository(),
    content: new MockContentRepository(),
    store: new InMemoryEnquiryStore(),
    limiter: new InMemoryRateLimiter(),
  };
}

function supabaseAdapters(): Adapters {
  const env = getEnv();
  const client = createPublicClient();
  const mediaBase = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-media`;
  return {
    puppies: cachePuppies(new SupabasePuppyRepository(client, mediaBase)),
    content: cacheContent(new SupabaseContentRepository(client, mediaBase, howItWorksCopy)),
    store: new SupabaseEnquiryStore(client),
    limiter: new PlatformRateLimiter('RL-PUB-1'),
  };
}

let cached: Container | undefined;

/** Composition root: the only place that picks adapters (DATA_SOURCE=mock|supabase). */
export function getContainer(): Container {
  if (cached) return cached;
  const env = getEnv();
  const adapters = env.DATA_SOURCE === 'supabase' ? supabaseAdapters() : mockAdapters();
  cached = {
    catalog: createCatalog(adapters.puppies),
    content: createContent(adapters.content),
    enquiries: createEnquiryService({
      store: adapters.store,
      limiter: adapters.limiter,
      clock: { now: () => new Date() },
      ids: { next: () => crypto.randomUUID() },
      consentTextVersion: env.CONSENT_TEXT_VERSION,
    }),
  };
  return cached;
}

export function resetContainer(): void {
  cached = undefined;
}
