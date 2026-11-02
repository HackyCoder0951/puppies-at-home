import type { SupabaseClient } from '@supabase/supabase-js';
import { SETTING_KEYS, type FaqAdminRow, type PuppyAdminDetail, type PuppyAdminRow, type TestimonialAdmin } from '../../domain';
import { RepositoryError, type CmsRepository, type FaqInput, type NewMedia, type PuppyInput, type SettingsInput, type TestimonialInput } from '../../application';

type Failure = { code?: string; message: string } | null;

function fail(error: Failure): never {
  const code = error?.code;
  if (code === '42501') throw new RepositoryError('forbidden', error?.message ?? '');
  if (code === '23505') throw new RepositoryError('conflict', error?.message ?? '');
  throw new RepositoryError('unavailable', error?.message ?? 'unknown');
}

interface PuppyRow {
  id: string; slug: string; name: string | null; breed: string; breeds: string[]; collections: string[]; sex: PuppyAdminRow['sex']; age_text: string;
  colour: string | null; origin: PuppyAdminRow['origin']; status: PuppyAdminRow['status']; gone_home_source: string | null; price_minor: number | null;
  published_at: string | null; deleted_at: string | null;
  puppy_media?: { id: string; kind: 'photo' | 'video'; storage_path: string; poster_path: string | null; alt: string; is_cover: boolean; sort_order: number }[];
}

const COLUMNS = 'id, slug, name, breed, breeds, collections, sex, age_text, colour, origin, status, gone_home_source, price_minor, published_at, deleted_at, puppy_media(id, kind, storage_path, poster_path, alt, is_cover, sort_order)';

export class SupabaseCmsRepository implements CmsRepository {
  constructor(private readonly client: SupabaseClient, private readonly mediaBaseUrl: string) {}

  private url = (path: string) => `${this.mediaBaseUrl.replace(/\/$/, '')}/${path}`;

  /** Runs an update/insert that must affect a row; RLS hides rows without raising, so zero rows means refused or gone. */
  private async touched(query: PromiseLike<{ data: unknown[] | null; error: Failure }>): Promise<void> {
    const { data, error } = await query;
    if (error) fail(error);
    if (!data?.length) throw new RepositoryError('forbidden', 'no row changed');
  }

  private row(p: PuppyRow): PuppyAdminRow {
    const media = [...(p.puppy_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    const cover = media.find((m) => m.is_cover) ?? media.find((m) => m.kind === 'photo');
    return {
      id: p.id, slug: p.slug, name: p.name, breed: p.breed, sex: p.sex, ageText: p.age_text, origin: p.origin, status: p.status, publishedAt: p.published_at,
      coverUrl: cover ? this.url(cover.kind === 'video' ? (cover.poster_path ?? cover.storage_path) : cover.storage_path) : null, deleted: Boolean(p.deleted_at),
    };
  }

  async listPuppies() {
    const { data, error } = await this.client.from('puppies').select(COLUMNS).is('deleted_at', null).order('status').order('sort_order');
    if (error) fail(error);
    return (data as unknown as PuppyRow[]).map((p) => this.row(p));
  }

  async getPuppy(id: string): Promise<PuppyAdminDetail | null> {
    const { data, error } = await this.client.from('puppies').select(COLUMNS).eq('id', id).maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const p = data as unknown as PuppyRow;
    return {
      ...this.row(p), breeds: p.breeds, collections: p.collections, colour: p.colour, goneHomeSource: p.gone_home_source,
      priceAed: p.price_minor === null ? null : Math.round(Number(p.price_minor) / 100),
      media: [...(p.puppy_media ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((m) => ({
        id: m.id, kind: m.kind, url: this.url(m.kind === 'video' ? (m.poster_path ?? m.storage_path) : m.storage_path), alt: m.alt, isCover: m.is_cover, sortOrder: m.sort_order,
      })),
    };
  }

  async slugExists(slug: string) {
    const { count, error } = await this.client.from('puppies').select('id', { count: 'exact', head: true }).eq('slug', slug);
    if (error) fail(error);
    return (count ?? 0) > 0;
  }

  private fields(input: PuppyInput) {
    return {
      name: input.name, breed: input.breed, breeds: input.breeds.length ? input.breeds : [input.breed], collections: input.collections, sex: input.sex,
      age_text: input.ageText, colour: input.colour, origin: input.origin, price_minor: input.priceAed === null ? null : input.priceAed * 100,
    };
  }

  async createPuppy(input: PuppyInput, slug: string) {
    const { data: last } = await this.client.from('puppies').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await this.client.from('puppies').insert({ ...this.fields(input), slug, sort_order: (last?.sort_order ?? 0) + 1 }).select('id').single();
    if (error) fail(error);
    return { id: (data as { id: string }).id };
  }

  updatePuppy(id: string, input: PuppyInput) {
    return this.touched(this.client.from('puppies').update(this.fields(input)).eq('id', id).select('id'));
  }

  setPublished(id: string, published: boolean) {
    return this.touched(this.client.from('puppies').update({ published_at: published ? new Date().toISOString() : null }).eq('id', id).select('id'));
  }

  setGoneHome(id: string, goneHome: boolean, source: 'TeddyPups' | 'Dubai showroom') {
    const patch = goneHome ? { status: 'gone_home', gone_home_source: source, gone_home_at: new Date().toISOString() } : { status: 'available', gone_home_source: null, gone_home_at: null };
    return this.touched(this.client.from('puppies').update(patch).eq('id', id).select('id'));
  }

  softDeletePuppy(id: string) {
    return this.touched(this.client.from('puppies').update({ deleted_at: new Date().toISOString(), published_at: null }).eq('id', id).select('id'));
  }

  async addMedia(puppyId: string, media: NewMedia) {
    const { data: existing, error: readError } = await this.client.from('puppy_media').select('sort_order, is_cover').eq('puppy_id', puppyId);
    if (readError) fail(readError);
    const rows = existing ?? [];
    const { error } = await this.client.from('puppy_media').insert({
      puppy_id: puppyId, kind: media.kind, storage_path: media.storagePath, poster_path: media.posterPath, alt: media.alt, width: media.width, height: media.height,
      duration_s: media.durationS, sort_order: rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0, is_cover: media.kind === 'photo' && !rows.some((r) => r.is_cover),
    });
    if (error) fail(error);
  }

  async removeMedia(mediaId: string) {
    const { data, error } = await this.client.from('puppy_media').delete().eq('id', mediaId).select('storage_path, poster_path');
    if (error) fail(error);
    if (!data?.length) throw new RepositoryError('forbidden', 'no row changed');
    return data.flatMap((r: { storage_path: string; poster_path: string | null }) => [r.storage_path, r.poster_path].filter((p): p is string => Boolean(p)));
  }

  async setCover(puppyId: string, mediaId: string) {
    // The unique index allows one cover per puppy: clear first, then set.
    const { error } = await this.client.from('puppy_media').update({ is_cover: false }).eq('puppy_id', puppyId).eq('is_cover', true);
    if (error) fail(error);
    await this.touched(this.client.from('puppy_media').update({ is_cover: true }).eq('id', mediaId).eq('puppy_id', puppyId).select('id'));
  }

  async listFaqs(): Promise<FaqAdminRow[]> {
    const { data, error } = await this.client.from('faqs').select('id, question, answer, sort_order, published_at').is('deleted_at', null).order('sort_order');
    if (error) fail(error);
    return (data ?? []).map((f: { id: string; question: string; answer: string; sort_order: number; published_at: string | null }) => ({ id: f.id, question: f.question, answer: f.answer, sortOrder: f.sort_order, publishedAt: f.published_at }));
  }

  async saveFaq(id: string | null, input: FaqInput) {
    if (id) return this.touched(this.client.from('faqs').update(input).eq('id', id).select('id'));
    const { data: last } = await this.client.from('faqs').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
    const { error } = await this.client.from('faqs').insert({ ...input, sort_order: (last?.sort_order ?? 0) + 1 });
    if (error) fail(error);
  }

  setFaqPublished(id: string, published: boolean) {
    return this.touched(this.client.from('faqs').update({ published_at: published ? new Date().toISOString() : null }).eq('id', id).select('id'));
  }

  softDeleteFaq(id: string) {
    return this.touched(this.client.from('faqs').update({ deleted_at: new Date().toISOString(), published_at: null }).eq('id', id).select('id'));
  }

  async getTestimonial(): Promise<TestimonialAdmin | null> {
    const { data, error } = await this.client.from('testimonials').select('id, quote, author, location, published_at').eq('is_featured', true).maybeSingle();
    if (error) fail(error);
    return data ? { id: data.id, quote: data.quote, author: data.author, location: data.location, publishedAt: data.published_at } : null;
  }

  async saveTestimonial(input: TestimonialInput, publish: boolean) {
    const current = await this.getTestimonial();
    const published_at = publish ? (current?.publishedAt ?? new Date().toISOString()) : null;
    if (current) return this.touched(this.client.from('testimonials').update({ ...input, published_at }).eq('id', current.id).select('id'));
    const { error } = await this.client.from('testimonials').insert({ ...input, is_featured: true, published_at });
    if (error) fail(error);
  }

  async getSettings() {
    const { data, error } = await this.client.from('site_settings').select('key, value').in('key', [...SETTING_KEYS]);
    if (error) fail(error);
    return Object.fromEntries((data ?? []).map((r: { key: string; value: unknown }) => [r.key, String(r.value)]));
  }

  async saveSettings(values: SettingsInput) {
    const rows = SETTING_KEYS.map((key) => ({ key, value: values[key], is_public: true }));
    await this.touched(this.client.from('site_settings').upsert(rows, { onConflict: 'key' }).select('key'));
  }
}
