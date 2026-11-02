/** Admin paths. Deliberately separate from `ROUTES`, `menus` and the sitemap: the admin has no public link (AC-012). */
export const adminPaths = {
  home: () => '/admin',
  login: (next?: string) => `/admin/login${next && safeAdminNext(next) === next ? `?next=${encodeURIComponent(next)}` : ''}`,
  forgotPassword: () => '/admin/forgot-password',
  resetPassword: () => '/admin/reset-password',
  puppies: () => '/admin/puppies',
  newPuppy: () => '/admin/puppies/new',
  puppy: (id: string) => `/admin/puppies/${encodeURIComponent(id)}`,
  faqs: () => '/admin/faqs',
  settings: () => '/admin/settings',
  enquiries: (params: { status?: string; q?: string; page?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.page && params.page > 1) sp.set('page', String(params.page));
    return `/admin/enquiries${sp.toString() ? `?${sp}` : ''}`;
  },
  enquiry: (id: string) => `/admin/enquiries/${encodeURIComponent(id)}`,
  customers: (params: { q?: string; page?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.page && params.page > 1) sp.set('page', String(params.page));
    return `/admin/customers${sp.toString() ? `?${sp}` : ''}`;
  },
  customer: (id: string) => `/admin/customers/${encodeURIComponent(id)}`,
  orders: (params: { status?: string; q?: string; page?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.status) sp.set('status', params.status);
    if (params.q) sp.set('q', params.q);
    if (params.page && params.page > 1) sp.set('page', String(params.page));
    return `/admin/orders${sp.toString() ? `?${sp}` : ''}`;
  },
  newOrder: (params: { customer?: string; puppy?: string | null; enquiry?: string } = {}) => {
    const sp = new URLSearchParams();
    if (params.customer) sp.set('customer', params.customer);
    if (params.puppy) sp.set('puppy', params.puppy);
    if (params.enquiry) sp.set('enquiry', params.enquiry);
    return `/admin/orders/new${sp.toString() ? `?${sp}` : ''}`;
  },
  order: (id: string) => `/admin/orders/${encodeURIComponent(id)}`,
  deliveries: () => '/admin/deliveries',
  authCallback: () => '/admin/auth/callback',
} as const;

/** Only same-site admin paths (with an optional plain query string) are valid redirect targets after sign-in. */
export function safeAdminNext(value: string | null | undefined): string {
  return value && /^\/admin(\/[A-Za-z0-9._~\-/]*)?(\?[A-Za-z0-9._~\-=&%]*)?$/.test(value) && !value.includes('//') ? value : adminPaths.home();
}
