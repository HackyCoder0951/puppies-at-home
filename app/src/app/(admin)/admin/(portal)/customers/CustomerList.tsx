import Link from 'next/link';
import { PAGE_SIZE, type CustomerRow } from '@backend/modules/inbox';
import { adminPaths } from '@nav';
import { ListControls } from '../ListControls';

export function CustomerList({ rows, total, page, q }: { rows: readonly CustomerRow[]; total: number; page: number; q?: string }) {
  return (
    <main className="grid gap-4">
      <h1 className="text-lg font-semibold">Customers <span className="text-sm font-normal" style={{ color: 'var(--adm-muted)' }}>({total})</span></h1>
      <ListControls action={adminPaths.customers()} q={q} page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} hrefFor={(p) => adminPaths.customers({ q, page: p })} />
      {rows.length === 0 ? <p className="adm-card text-sm">No customers match.</p> : null}
      <ul className="grid gap-3">
        {rows.map((c) => (
          <li key={c.id} className="adm-card grid gap-1">
            <Link href={adminPaths.customer(c.id)} className="adm-link font-medium">{c.fullName}</Link>
            <span className="text-sm" style={{ color: 'var(--adm-muted)' }}>{[c.phone, c.email, c.area].filter(Boolean).join(' · ') || 'No contact details'}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
