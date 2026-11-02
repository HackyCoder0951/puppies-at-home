/** Public API of the cms module. `createStaffCms` wires the Supabase adapters for one signed-in request. */
import { createSessionClient, supabasePublicConfig } from '@platform';
import { createCms, type Cms, type ContentPublisher } from './application';
import { SharpMediaProbe, SupabaseCmsRepository, SupabaseMediaStore } from './infrastructure';

export { moduleDefinition } from './module.config';
export type { Cms, CmsError, ContentPublisher } from './application';
export type { PuppyAdminRow, PuppyAdminDetail, MediaAdminRow, FaqAdminRow, TestimonialAdmin } from './domain';
export { SETTING_KEYS } from './domain';
export { cmsMessage } from './presentation';

export async function createStaffCms(publisher: ContentPublisher): Promise<Cms> {
  const client = await createSessionClient();
  const mediaBase = `${supabasePublicConfig().url}/storage/v1/object/public/site-media`;
  return createCms({
    repo: new SupabaseCmsRepository(client, mediaBase),
    media: new SupabaseMediaStore(client),
    probe: new SharpMediaProbe(),
    publisher,
    ids: { next: () => crypto.randomUUID() },
  });
}
