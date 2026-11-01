/**
 * Public API of the module: the only file other modules and `app/` may import.
 * Everything else in this folder is internal (docs/02-architecture/21-modular-monolith-architecture.md section 6).
 */
export { moduleDefinition } from './module.config';
export { Gallery, SiteShell, Scene, NotFound, LegalPage, HomeView, type HomeData } from './presentation';
