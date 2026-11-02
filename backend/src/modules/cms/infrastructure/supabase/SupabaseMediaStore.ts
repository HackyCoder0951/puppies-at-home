import type { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError, type MediaStore } from '../../application';

/** Uploads to the public `site-media` bucket as the signed-in staff member (storage policy: content.write). */
export class SupabaseMediaStore implements MediaStore {
  constructor(private readonly client: SupabaseClient) {}

  async upload(path: string, bytes: Uint8Array, contentType: string) {
    const { error } = await this.client.storage.from('site-media').upload(path, bytes, { contentType, upsert: false });
    if (error) throw new RepositoryError(/policy|permission|unauthorized/i.test(error.message) ? 'forbidden' : 'unavailable', error.message);
  }

  async remove(paths: readonly string[]) {
    if (!paths.length) return;
    const { error } = await this.client.storage.from('site-media').remove([...paths]);
    if (error) throw new RepositoryError('unavailable', error.message);
  }
}
