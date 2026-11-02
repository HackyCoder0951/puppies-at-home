'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { NavGroup } from './nav';

/** Left navigation rail: grouped sections with count badges; the current section is marked with aria-current. */
export function Rail({ groups }: { groups: readonly NavGroup[] }) {
  const path = usePathname();
  // The menu is a drop-down on phones; it belongs to the page it was opened on, so it closes after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === path;
  const current = (href: string) => (href === '/admin' ? path === '/admin' : path === href || path.startsWith(`${href}/`));
  return (
    <aside className="adm-rail" aria-label="Sections" data-open={open}>
      <Link href="/admin" className="adm-rail-brand" aria-label="TeddyPups admin home"><span className="adm-glyph" aria-hidden="true">🐾</span><span>TeddyPups</span></Link>
      <button type="button" className="adm-menu-btn" aria-expanded={open} aria-controls="adm-nav" onClick={() => setOpenOn(open ? null : path)}>{open ? 'Close' : 'Menu'}</button>
      <nav aria-label="Admin" id="adm-nav">
        {groups.map((g) => (
          <div key={g.heading} className="adm-rail-group">
            <p className="adm-rail-heading">{g.heading}</p>
            {g.items.map((i) => (
              <Link key={i.href} href={i.href} className="adm-rail-link" aria-current={current(i.href) ? 'page' : undefined} title={i.label}>
                <span className="flex items-center gap-2"><span className="adm-glyph" aria-hidden="true">{i.glyph}</span><span className="adm-rail-label">{i.label}</span></span>
                {i.count ? <span className="adm-count" aria-label={`${i.count} ${i.alert ? 'need attention' : 'waiting'}`}>{i.count}</span> : null}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
