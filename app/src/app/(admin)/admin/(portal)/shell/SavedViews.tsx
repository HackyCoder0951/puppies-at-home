'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface View { name: string; query: string }

/** Saved views: named filter sets kept in this browser (localStorage), one list per screen. Shown as chips above the table. */
export function SavedViews({ listKey }: { listKey: string }) {
  const path = usePathname();
  const params = useSearchParams();
  const [views, setViews] = useState<View[]>([]);
  const storage = `adm-views:${listKey}`;
  useEffect(() => {
    try { setViews(JSON.parse(localStorage.getItem(storage) ?? '[]') as View[]); } catch { setViews([]); }
  }, [storage]);
  const persist = (next: View[]) => { setViews(next); try { localStorage.setItem(storage, JSON.stringify(next)); } catch { /* private mode: the views just do not persist */ } };
  const query = params.toString();
  const save = () => {
    const name = window.prompt('Name this view');
    if (name?.trim() && query) persist([...views.filter((v) => v.name !== name.trim()), { name: name.trim().slice(0, 40), query }].slice(-8));
  };
  return (
    <div className="adm-attention items-center" aria-label="Saved views">
      {views.map((v) => (
        <span key={v.name} className="adm-chip">
          <Link href={`${path}?${v.query}`} className="adm-link">{v.name}</Link>
          <button type="button" aria-label={`Remove saved view ${v.name}`} onClick={() => persist(views.filter((x) => x.name !== v.name))} className="adm-muted">×</button>
        </span>
      ))}
      <button type="button" onClick={save} disabled={!query} className="adm-btn adm-btn-secondary adm-btn-small" title={query ? 'Save the current filters' : 'Apply a filter first'}>Save this view</button>
    </div>
  );
}
