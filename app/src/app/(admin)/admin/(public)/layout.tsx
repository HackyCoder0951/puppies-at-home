import type { ReactNode } from 'react';

/** Sign-in and security screens: a brand panel beside a clean form. */
export default function PublicAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between p-10 lg:flex" style={{ background: 'var(--sidebar)', color: 'var(--sidebar-ink)' }}>
        <p className="adm-title">TeddyPups</p>
        <p className="max-w-sm text-lg" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>The back office for puppies, families and deliveries.</p>
      </aside>
      <main className="mx-auto grid w-full max-w-md content-center gap-6 px-4 py-10">
        <h1 className="adm-title lg:hidden">TeddyPups admin</h1>
        {children}
      </main>
    </div>
  );
}
