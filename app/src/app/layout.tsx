import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/figtree';
import '@fontsource-variable/shantell-sans';
import './globals.css';

export const metadata: Metadata = {
  title: 'TeddyPups U.A.E. — Premium teacup puppies in Dubai',
  description:
    'Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders.',
};

export const viewport: Viewport = {
  themeColor: '#fffdf8',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
