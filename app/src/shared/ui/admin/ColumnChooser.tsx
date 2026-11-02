'use client';

import { useMemo, useSyncExternalStore } from 'react';

const CHANGED = 'adm-cols-changed';
const subscribe = (notify: () => void) => {
  window.addEventListener(CHANGED, notify);
  window.addEventListener('storage', notify);
  return () => { window.removeEventListener(CHANGED, notify); window.removeEventListener('storage', notify); };
};

/** Show or hide table columns. The choice is stored in this browser and applied with a small style rule (no layout jump on reload). */
export function ColumnChooser({ tableId, columns }: { tableId: string; columns: readonly { key: string; header: string }[] }) {
  const storage = `adm-cols:${tableId}`;
  const raw = useSyncExternalStore(subscribe, () => { try { return localStorage.getItem(storage) ?? '[]'; } catch { return '[]'; } }, () => '[]');
  const hidden = useMemo<string[]>(() => { try { return JSON.parse(raw) as string[]; } catch { return []; } }, [raw]);
  const toggle = (key: string) => {
    const next = hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key];
    try { localStorage.setItem(storage, JSON.stringify(next)); } catch { /* private mode */ }
    window.dispatchEvent(new Event(CHANGED));
  };
  return (
    <details className="mb-2 text-sm">
      <summary className="adm-link cursor-pointer">Columns</summary>
      <style>{hidden.map((k) => `#${tableId} [data-col="${k}"]{display:none}`).join('')}</style>
      <fieldset className="adm-card mt-2 flex flex-wrap gap-4 p-3"><legend className="sr-only">Visible columns</legend>
        {columns.map((c) => (<label key={c.key} className="flex items-center gap-2"><input type="checkbox" checked={!hidden.includes(c.key)} onChange={() => toggle(c.key)} /> {c.header}</label>))}
      </fieldset>
    </details>
  );
}
