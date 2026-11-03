import type { KnowledgeData } from '../../domain';
import faqs from './v1/faqs.json';
import goneHome from './v1/gone-home.json';
import info from './v1/info.json';
import manifest from './v1/manifest.json';
import puppies from './v1/puppies.json';
import settings from './v1/settings.json';

/** The generated, versioned knowledge files (`npm run knowledge`). Read-only at runtime. */
export function loadKnowledgeV1(): KnowledgeData {
  return { version: manifest.version, puppies, goneHome, faqs, info, settings } as KnowledgeData;
}
