'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo, useSyncExternalStore } from 'react';

interface View { name: string; query: string }
const CHANGED = 'adm-views-changed';

const subscribe = (notify: () => void) => {
  window.addEventListener(CHANGED, notify);
  window.addEventListener('storage', notify);
  return () => { window.removeEventListener(CHANGED, notify); window.removeEventListener('storage', notify); };
};

/** Saved views: named filter sets kept in this browser (localStorage), one list per screen. Shown as chips above the table. */
export function SavedViews({ listKey }: { listKey: string }) {
  const path = usePathname();
  const params = useSearchParams();
  const storage = `adm-views:${listKey}`;
  const raw = useSyncExternalStore(subscribe, () => { try { return localStorage.getItem(storage) ?? '[]'; } catch { return '[]'; } }, () => '[]');
  const views = useMemo<View[]>(() => { try { return JSON.parse(raw) as View[]; } catch { return []; } }, [raw]);
  const persist = (next: View[]) => {
    try { localStorage.setItem(storage, JSON.stringify(next)); } catch { /* private mode: the views just do not persist */ }
    window.dispatchEvent(new Event(CHANGED));
  };
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
