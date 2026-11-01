import type { MetadataRoute } from 'next';
import { paths, sitemapPaths } from '@nav';
import { getContainer } from '@composition';
import { getEnv } from '@shared/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getEnv().NEXT_PUBLIC_SITE_URL;
  const slugs = await getContainer().catalog.listSlugs();
  return sitemapPaths(slugs.map(paths.puppy)).map((path) => ({ url: `${base}${path}` }));
}
