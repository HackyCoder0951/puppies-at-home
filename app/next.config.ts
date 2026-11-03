import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import { originOf, publicCsp } from '../backend/src/platform/security/csp';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Two root layouts (site and admin) need one standalone 404 page.
  experimental: { globalNotFound: true },
  async headers() {
    const dev = process.env.NODE_ENV !== 'production';
    const common = [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
    ];
    return [
      { source: '/:path*', headers: common },
      { source: '/((?!admin(?:/|$)).*)', headers: [{ key: 'Content-Security-Policy', value: publicCsp({ supabaseOrigin: originOf(process.env.NEXT_PUBLIC_SUPABASE_URL), dev }) }] },
      // The admin must never be framed (clickjacking); its own nonce-based Content-Security-Policy is set per request in proxy.ts.
      { source: '/admin/:path*', headers: [{ key: 'X-Frame-Options', value: 'DENY' }] },
    ];
  },
  turbopack: { root: fileURLToPath(new URL('..', import.meta.url)) },
};

export default nextConfig;
