/**
 * Public API of the module: the only file other modules and `app/` may import.
 * Everything else in this folder is internal (docs/02-architecture/21-modular-monolith-architecture.md section 6).
 */
export { moduleDefinition } from './module.config';
export type { Faq, FamilyPhoto, Testimonial, SiteSettings, HowItWorksCopy } from './domain';
export { whatsappLink, searchFaqs } from './domain';
export type { Content, ContentRepository } from './application';
export { FamiliesView, HowItWorksView, FaqView, ContactView } from './presentation';
