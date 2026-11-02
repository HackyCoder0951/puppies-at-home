import Link from 'next/link';
import type { AuditRow } from '@backend/modules/reporting';
import { adminPaths } from '@nav';
import { DataTable, PageHeader } from '@shared/ui/admin';

const FILTERS = [['', 'All'], ['auth.', 'Sign-ins'], ['privacy.', 'Privacy'], ['export', 'Exports'], ['staff.', 'Staff'], ['insert', 'Created'], ['update', 'Changed'], ['delete', 'Deleted']] as const;

/** Append-only trail: who did what, when, and which fields changed. Values stay behind "Details". */
export function AuditList({ rows, total, page, action }: { rows: readonly AuditRow[]; total: number; page: number; action?: string }) {
  const pages = Math.max(1, Math.ceil(total / 50));
  return (
    <main className="grid gap-4">
      <PageHeader title="Audit log" description={`${total} entries, newest first. The log cannot be edited.`} />
      <nav aria-label="Filter" className="adm-attention">{FILTERS.map(([v, label]) => (<Link key={v} href={adminPaths.audit({ action: v })} className="adm-chip" aria-current={(action ?? '') === v ? 'page' : undefined}>{label}</Link>))}</nav>
      <DataTable
        caption="Audit log" rows={rows} rowKey={(r) => String(r.id)} empty="No entries."
        columns={[
          { key: 'at', header: 'When', cell: (r) => new Date(r.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'medium' }) },
          { key: 'actor', header: 'Who', cell: (r) => r.actor ?? 'System or visitor' },
          { key: 'action', header: 'Action', cell: (r) => r.action },
          { key: 'entity', header: 'Record', cell: (r) => `${r.entity}${r.entityId ? ` ${r.entityId.slice(0, 8)}` : ''}` },
          { key: 'changed', header: 'Changed', cell: (r) => (r.changed.length ? <details><summary className="adm-link cursor-pointer">{r.changed.slice(0, 3).join(', ')}{r.changed.length > 3 ? '…' : ''}</summary><pre className="mt-2 max-w-xl overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify({ before: r.before, after: r.after }, null, 2)}</pre></details> : '—') },
        ]}
      />
      {pages > 1 ? (
        <nav aria-label="Pages" className="flex items-center gap-4 text-sm">
          {page > 1 ? <Link href={adminPaths.audit({ action, page: page - 1 })} className="adm-link">Previous</Link> : null}
          <span>Page {page} of {pages}</span>
          {page < pages ? <Link href={adminPaths.audit({ action, page: page + 1 })} className="adm-link">Next</Link> : null}
        </nav>
      ) : null}
    </main>
  );
}
