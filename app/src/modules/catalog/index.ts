/**
 * Public API of the module: the only file other modules and `app/` may import.
 * Everything else in this folder is internal (docs/02-architecture/21-modular-monolith-architecture.md section 6).
 */
export { moduleDefinition } from './module.config';
export type { Puppy, Media, Sex, PuppyFilter, FacetOption } from './domain';
export { SEX_LABEL, cover, slugify, isEmptyFilter, parseFilter } from './domain';
export type { Catalog, PuppyListing, PuppyDetail, PuppyRepository } from './application';
export { PuppiesView, PuppyDetailView, GoneHomeView } from './presentation';
