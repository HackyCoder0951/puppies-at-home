import type { ReactNode } from 'react';

/** Placeholder legal page pending owner approval of the final text (decision D16). Not on the reference site. */
export function LegalPage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className="relative pt-[var(--header-h)] outline-none">
      <div className="tp-page gutter mx-auto max-w-3xl py-20">
        <h1 className="font-plush text-huge">{title}</h1>
        <div className="text-lede mt-6 space-y-4">
          {children ?? <p>This page is a placeholder. The final text will be provided after legal review.</p>}
        </div>
      </div>
    </main>
  );
}
