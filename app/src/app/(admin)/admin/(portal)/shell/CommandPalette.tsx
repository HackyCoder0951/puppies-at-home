'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface PaletteEntry { readonly label: string; readonly href: string; readonly hint?: string }

/** Ctrl/Cmd+K: jump to any section or start common work. A native dialog gives focus trapping and Escape for free. */
export function CommandPalette({ entries }: { entries: readonly PaletteEntry[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const shown = useMemo(() => entries.filter((e) => `${e.label} ${e.hint ?? ''}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12), [entries, query]);

  const open = () => { setQuery(''); setActive(0); ref.current?.showModal(); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const go = (href: string) => { ref.current?.close(); router.push(href); };

  return (
    <>
      <button type="button" onClick={open} className="adm-btn adm-btn-secondary adm-btn-small" aria-keyshortcuts="Control+K Meta+K">Search or jump <kbd className="adm-muted">Ctrl K</kbd></button>
      <dialog ref={ref} className="adm-palette" aria-label="Command palette">
        <div className="grid gap-2 p-3">
          <label htmlFor="palette-q" className="sr-only">Search sections and actions</label>
          <input
            id="palette-q" className="adm-input" placeholder="Go to…" value={query} autoComplete="off"
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, shown.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              if (e.key === 'Enter' && shown[active]) go(shown[active].href);
            }}
          />
          <ul role="listbox" aria-label="Results" className="grid gap-1">
            {shown.map((e, i) => (
              <li key={e.href + e.label} role="option" aria-selected={i === active}>
                <button type="button" onClick={() => go(e.href)} className="adm-rail-link w-full text-left" style={i === active ? { background: 'var(--surface-2)' } : undefined}>
                  <span>{e.label}</span><span className="adm-muted text-xs">{e.hint}</span>
                </button>
              </li>
            ))}
            {shown.length === 0 ? <li className="adm-muted p-2 text-sm">Nothing matches.</li> : null}
          </ul>
        </div>
      </dialog>
    </>
  );
}
