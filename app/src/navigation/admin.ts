/** Admin paths. Deliberately separate from `ROUTES`, `menus` and the sitemap: the admin has no public link (AC-012). */
export const adminPaths = {
  home: () => '/admin',
  login: (next?: string) => `/admin/login${next && next.startsWith('/admin') && !next.startsWith('//') ? `?next=${encodeURIComponent(next)}` : ''}`,
  forgotPassword: () => '/admin/forgot-password',
  resetPassword: () => '/admin/reset-password',
  authCallback: () => '/admin/auth/callback',
} as const;

/** Only same-site admin paths are valid redirect targets after sign-in. */
export function safeAdminNext(value: string | null | undefined): string {
  return value && /^\/admin(\/[A-Za-z0-9._~\-/]*)?$/.test(value) && !value.includes('//') ? value : adminPaths.home();
}
