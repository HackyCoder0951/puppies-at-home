import type { SupabaseClient } from '@supabase/supabase-js';
import { mapPuppy, type MediaRow, type PuppyRow } from './mapPuppy';
import type { PuppyView } from './readModel';

/** Reads published puppies through the public views only (anon key; never the base tables). */
export class SupabasePuppyRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly mediaBaseUrl: string,
  ) {}

  private async load(status: 'available' | 'gone_home'): Promise<readonly PuppyView[]> {
    const { data: rows, error } = await this.client
      .from('v_public_puppies')
      .select('*')
      .in('status', status === 'available' ? ['available', 'reserved'] : ['gone_home'])
      .order(status === 'gone_home' ? 'gone_home_at' : 'sort_order', { ascending: status !== 'gone_home' })
      .order('sort_order', { ascending: true });
    if (error) throw new Error(`catalog: ${error.message}`);
    const puppies = (rows ?? []) as PuppyRow[];
    if (!puppies.length) return [];
    const { data: media, error: mediaError } = await this.client
      .from('v_public_puppy_media')
      .select('*')
      .in('puppy_slug', puppies.map((p) => p.slug));
    if (mediaError) throw new Error(`catalog media: ${mediaError.message}`);
    const bySlug = new Map<string, MediaRow[]>();
    for (const m of (media ?? []) as MediaRow[]) bySlug.set(m.puppy_slug, [...(bySlug.get(m.puppy_slug) ?? []), m]);
    return puppies.map((p) => mapPuppy(p, bySlug.get(p.slug) ?? [], this.mediaBaseUrl));
  }

  async listAvailable(): Promise<readonly PuppyView[]> {
    return this.load('available');
  }

  async listGoneHome(): Promise<readonly PuppyView[]> {
    return this.load('gone_home');
  }
}
