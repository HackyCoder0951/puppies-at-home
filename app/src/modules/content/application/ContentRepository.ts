import type { FamilyPhoto, Faq, SiteSettings, Testimonial } from '../domain';

/** Port for editable site content. Adapters: mock fixtures now, Supabase later. */
export interface ContentRepository {
  settings(): Promise<SiteSettings>;
  faqs(): Promise<readonly Faq[]>;
  familyPhotos(): Promise<readonly FamilyPhoto[]>;
  testimonial(): Promise<Testimonial>;
}
