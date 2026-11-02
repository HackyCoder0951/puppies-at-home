/**
 * Each module declares what it contributes in `module.config.ts`. The composition root collects the
 * definitions; `navigation` merges the routes and menu items (docs/02-architecture/21 section 8).
 */
export type RouteArea = 'site' | 'admin';
export type RouteAccess = 'public' | 'authenticated';

export interface RouteDeclaration {
  /** Stable id, for example `puppy.detail`. */
  readonly id: string;
  /** Path pattern, for example `/puppies/[slug]`. */
  readonly path: string;
  readonly area: RouteArea;
  readonly access: RouteAccess;
}

export interface ModuleDefinition {
  readonly id: string;
  readonly description: string;
  readonly routes: readonly RouteDeclaration[];
  /** Permission keys the module declares (`docs/03-security-privacy/07-rbac-and-rls-spec.md`). */
  readonly permissions: readonly string[];
  /** Domain event names the module emits. */
  readonly events: readonly string[];
}
