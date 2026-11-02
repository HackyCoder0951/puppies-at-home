import Link from 'next/link';
import type { ReactNode } from 'react';

/** GET search form (no JavaScript needed) plus previous and next links for a paged list. */
export function ListControls({ action, q, hidden, filters, page, pages, hrefFor }: { action: string; q?: string; hidden?: Record<string, string>; filters?: ReactNode; page: number; pages: number; hrefFor: (page: number) => string }) {
  return (
    <div className="grid gap-3">
      <form action={action} method="get" className="flex flex-wrap items-end gap-3" role="search">
        {Object.entries(hidden ?? {}).map(([k, v]) => (<input key={k} type="hidden" name={k} value={v} />))}
        {filters}
        <div className="grid gap-1">
          <label htmlFor="q" className="text-sm font-medium">Search</label>
          <input id="q" name="q" defaultValue={q} placeholder="Name, phone or email" className="adm-input" />
        </div>
        <button type="submit" className="adm-btn">Search</button>
      </form>
      {pages > 1 ? (
        <nav aria-label="Pages" className="flex items-center gap-4 text-sm">
          {page > 1 ? <Link href={hrefFor(page - 1)} className="adm-link">Previous</Link> : null}
          <span>Page {page} of {pages}</span>
          {page < pages ? <Link href={hrefFor(page + 1)} className="adm-link">Next</Link> : null}
        </nav>
      ) : null}
    </div>
  );
}
