'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavGroup } from './nav';

/** Left navigation rail: grouped sections with count badges; the current section is marked with aria-current. */
export function Rail({ groups }: { groups: readonly NavGroup[] }) {
  const path = usePathname();
  const current = (href: string) => (href === '/admin' ? path === '/admin' : path === href || path.startsWith(`${href}/`));
  return (
    <aside className="adm-rail" aria-label="Sections">
      <Link href="/admin" className="adm-rail-brand" aria-label="TeddyPups admin home"><span className="adm-glyph" aria-hidden="true">🐾</span><span>TeddyPups</span></Link>
      <nav aria-label="Admin">
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
