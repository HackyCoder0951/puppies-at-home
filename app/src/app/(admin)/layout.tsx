import type { Viewport } from 'next';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import '../fonts.css';
import './admin-tokens.css';

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#2a170e' };

/**
 * Admin root layout: its own <html> and <body>, brand tokens and fonts, none of the public site's styles.
 * The colour mode comes from a cookie so the first paint is already right ('system' follows the OS).
 */
export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const mode = (await cookies()).get('adm-theme')?.value;
  return (
    <html lang="en" data-theme={mode === 'light' || mode === 'dark' ? mode : undefined}>
      <body>{children}</body>
    </html>
  );
}
