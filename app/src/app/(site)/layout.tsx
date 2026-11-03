import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SiteShell } from '@modules/storefront';
import { getEnv } from '@shared/config';
import '../fonts.css';
import '../reference.css';
import '../extras.css';

export const metadata: Metadata = {
  metadataBase: new URL(getEnv().NEXT_PUBLIC_SITE_URL),
  openGraph: { type: 'website', siteName: 'TeddyPups U.A.E.', locale: 'en_AE' },
  twitter: { card: 'summary_large_image' },
  title: 'TeddyPups U.A.E. — Premium teacup puppies in Dubai',
  description:
    'Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders.',
};

export const viewport: Viewport = { themeColor: '#fffdf8', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

/** Public site root layout: the only place the public stylesheet (curtain, paw cursor, mascot) is loaded. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteShell assistant={getEnv().ASSISTANT_ENABLED}>{children}</SiteShell>
      </body>
    </html>
  );
}
