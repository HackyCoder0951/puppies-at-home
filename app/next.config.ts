import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Two root layouts (site and admin) need one standalone 404 page.
  experimental: { globalNotFound: true },
  async headers() {
    const common = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
    ];
    return [
      { source: '/:path*', headers: common },
      // The admin must never be framed (clickjacking) and is not indexed.
      { source: '/admin/:path*', headers: [{ key: 'X-Frame-Options', value: 'DENY' }, { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" }] },
    ];
  },
  turbopack: { root: fileURLToPath(new URL('..', import.meta.url)) },
};

export default nextConfig;
