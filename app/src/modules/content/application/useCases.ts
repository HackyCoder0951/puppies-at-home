import { searchFaqs } from '../domain';
import type { ContentRepository } from './ContentRepository';

export const createContent = (repo: ContentRepository) => ({
  getSettings: () => repo.settings(),
  getTestimonial: () => repo.testimonial(),
  listFamilyPhotos: () => repo.familyPhotos(),
  async listFaqs(term = '') {
    return searchFaqs(await repo.faqs(), term);
  },
  async faqPreview(count = 3) {
    return (await repo.faqs()).slice(0, count);
  },
});

export type Content = ReturnType<typeof createContent>;
