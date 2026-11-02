import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** Every admin page depends on the session cookie: never prerender. */
export const dynamic = 'force-dynamic';

/** Admin area: no SEO, no indexing, no site chrome (AC-012). */
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
