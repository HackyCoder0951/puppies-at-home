import type { ReactNode } from 'react';

export default function PublicAdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-md content-center gap-6 px-4 py-10">
      <h1 className="text-xl font-semibold">TeddyPups admin</h1>
      {children}
    </main>
  );
}
