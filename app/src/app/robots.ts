import type { MetadataRoute } from 'next';
import { getEnv } from '@shared/config';

export default function robots(): MetadataRoute.Robots {
  const base = getEnv().NEXT_PUBLIC_SITE_URL;
  const production = getEnv().APP_ENV === 'production';
  return {
    rules: production ? { userAgent: '*', allow: '/', disallow: ['/admin', '/dev', '/api', '/payment', '/privacy-request'] } : { userAgent: '*', disallow: '/' },
    sitemap: `${base}/sitemap.xml`,
  };
}
