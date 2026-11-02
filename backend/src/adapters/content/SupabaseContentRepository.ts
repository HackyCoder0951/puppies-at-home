import type { SupabaseClient } from '@supabase/supabase-js';
import { mediaUrl } from '../catalog';

export interface FamilyPhotoView { readonly id: string; readonly src: string; readonly width: number; readonly height: number; readonly alt: string; readonly caption?: string; readonly color: string }
export interface FaqView { readonly question: string; readonly answer: string }
export interface TestimonialView { readonly quote: string; readonly attribution: string }
export interface SiteSettingsView {
  readonly whatsappNumber: string; readonly whatsappHref: string; readonly whatsappText: string; readonly phoneHref: string;
  readonly email: string; readonly mapsHref: string; readonly instagram: string; readonly tiktok: string; readonly facebook: string;
  readonly address: string; readonly contactFormPuppyOptions: readonly string[];
}

const SEX_WORD = { male: 'boy', female: 'girl', 'male-female': 'boy & girl' } as const;

/**
 * Content reads from the public views. Static page copy that is authored in code (how it works) is injected, so this
 * adapter stays free of app imports.
 */
export class SupabaseContentRepository<HowItWorks> {
  constructor(
    private readonly client: SupabaseClient,
    private readonly mediaBaseUrl: string,
    private readonly howItWorksCopy: HowItWorks,
  ) {}

  async settings(): Promise<SiteSettingsView> {
    const [{ data: rows, error }, { data: puppies, error: pe }] = await Promise.all([
      this.client.from('v_public_settings').select('key, value'),
      this.client.from('v_public_puppies').select('name, breed, sex, status, sort_order').eq('status', 'available').order('sort_order', { ascending: true }),
    ]);
    if (error) throw new Error(`settings: ${error.message}`);
    if (pe) throw new Error(`settings puppies: ${pe.message}`);
    const s = new Map((rows ?? []).map((r: { key: string; value: unknown }) => [r.key, String(r.value)]));
    const text = s.get('whatsapp_text') ?? '';
    const number = s.get('whatsapp_number') ?? '';
    const options = [
      'any puppy (not sure yet)',
      ...(puppies ?? []).map((p: { name: string | null; breed: string; sex: keyof typeof SEX_WORD }) =>
        p.name && p.name.trim() ? `${p.name} (${p.breed}, ${SEX_WORD[p.sex]})` : `${p.breed} (${SEX_WORD[p.sex]})`),
    ];
    return {
      whatsappNumber: number,
      whatsappHref: `https://wa.me/${number}?text=${encodeURIComponent(text)}`,
      whatsappText: text,
      phoneHref: s.get('phone_href') ?? '',
      email: s.get('email') ?? '',
      mapsHref: s.get('maps_href') ?? '',
      instagram: s.get('instagram') ?? '',
      tiktok: s.get('tiktok') ?? '',
      facebook: s.get('facebook') ?? '',
      address: s.get('address') ?? '',
      contactFormPuppyOptions: options,
    };
  }

  async faqs(): Promise<readonly FaqView[]> {
    const { data, error } = await this.client.from('v_public_faqs').select('question, answer').order('sort_order', { ascending: true });
    if (error) throw new Error(`faqs: ${error.message}`);
    return (data ?? []) as FaqView[];
  }

  async familyPhotos(): Promise<readonly FamilyPhotoView[]> {
    const { data, error } = await this.client.from('v_public_families').select('*').order('sort_order', { ascending: true });
    if (error) throw new Error(`families: ${error.message}`);
    return (data ?? []).map((r: { id: string; storage_path: string; width: number | null; height: number | null; alt: string; caption: string | null; color: string }) => ({
      id: r.id, src: mediaUrl(this.mediaBaseUrl, r.storage_path), width: r.width ?? 1, height: r.height ?? 1, alt: r.alt, caption: r.caption ?? undefined, color: r.color,
    }));
  }

  async testimonial(): Promise<TestimonialView> {
    const { data, error } = await this.client.from('v_public_testimonial').select('quote, author, location').limit(1).maybeSingle();
    if (error) throw new Error(`testimonial: ${error.message}`);
    if (!data) return { quote: '', attribution: '' };
    return { quote: data.quote, attribution: [data.author, data.location].filter(Boolean).join(', ') };
  }

  async howItWorks(): Promise<HowItWorks> {
    return this.howItWorksCopy;
  }
}
