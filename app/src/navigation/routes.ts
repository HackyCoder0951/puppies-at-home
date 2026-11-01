/** Typed route registry. Every internal link in the app is built from here. */
export const ROUTES = {
  home: { path: '/', label: 'Home', title: 'TeddyPups U.A.E.' },
  puppies: { path: '/puppies', label: 'Puppies', title: 'Puppies' },
  goneHome: { path: '/gone-home', label: 'Gone home', title: 'Gone home' },
  families: { path: '/happy-families', label: 'Happy families', title: 'Happy families' },
  howItWorks: { path: '/how-it-works', label: 'How it works', title: 'How it works' },
  faq: { path: '/faq', label: 'FAQ', title: 'FAQ' },
  contact: { path: '/contact', label: 'Visit & contact', title: 'Visit & contact' },
  privacy: { path: '/privacy', label: 'Privacy', title: 'Privacy' },
  terms: { path: '/terms', label: 'Terms', title: 'Terms' },
} as const;

export type RouteKey = keyof typeof ROUTES;

export interface PuppyFilters {
  breed?: readonly string[];
  sex?: readonly string[];
  origin?: 'local' | 'imported';
  collection?: readonly string[];
}

function query(filters: PuppyFilters): string {
  const sp = new URLSearchParams();
  for (const key of ['breed', 'sex', 'collection'] as const) {
    for (const v of filters[key] ?? []) sp.append(key, v);
  }
  if (filters.origin) sp.set('origin', filters.origin);
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/** Link builders. Pages are never hand-written as strings outside this file. */
export const paths = {
  home: () => ROUTES.home.path,
  puppies: (filters: PuppyFilters = {}) => `${ROUTES.puppies.path}${query(filters)}`,
  puppy: (slug: string) => `${ROUTES.puppies.path}/${encodeURIComponent(slug)}`,
  goneHome: () => ROUTES.goneHome.path,
  families: () => ROUTES.families.path,
  howItWorks: (anchor?: string) => `${ROUTES.howItWorks.path}${anchor ? `#${anchor}` : ''}`,
  faq: () => ROUTES.faq.path,
  contact: () => ROUTES.contact.path,
  privacy: () => ROUTES.privacy.path,
  terms: () => ROUTES.terms.path,
} as const;

export interface MenuItem {
  readonly key: RouteKey;
  readonly label: string;
  readonly href: string;
}

const item = (key: RouteKey, label?: string): MenuItem => ({ key, label: label ?? ROUTES[key].label, href: ROUTES[key].path });

export const menus = {
  header: [item('puppies'), item('goneHome'), item('families'), item('howItWorks'), item('faq'), item('contact')],
  footerExplore: [
    item('puppies'), item('goneHome'), item('families'), item('howItWorks'), item('faq'), item('contact'),
    { key: 'howItWorks', label: 'Delivery & collection', href: paths.howItWorks('delivery') } as MenuItem,
  ],
  legal: [item('privacy'), item('terms')],
} as const;

/** True when `current` is the item's route or inside it (for example /puppies/max under /puppies). */
export function isActive(currentPath: string, href: string): boolean {
  const base = href.split('#')[0] ?? href;
  if (base === '/') return currentPath === '/';
  return currentPath === base || currentPath.startsWith(`${base}/`);
}

/** Sitemap entries for indexable static routes; the dev gallery and admin are never listed. */
export function sitemapPaths(extra: readonly string[] = []): string[] {
  return [...Object.values(ROUTES).map((r) => r.path), ...extra];
}
