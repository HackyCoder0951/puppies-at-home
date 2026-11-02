import type { MessageRow } from '@backend/modules/messaging';
import { MESSAGE_STATUS_LABEL } from '@backend/modules/messaging';
import { adminPaths } from '@nav';
import { Badge, DataTable, PageHeader } from '@shared/ui/admin';
import { ListControls } from '../ListControls';

export function MessageLog({ rows, total, page, status }: { rows: readonly MessageRow[]; total: number; page: number; status?: string }) {
  return (
    <main className="grid gap-4">
      <PageHeader title="Messages" description={`${total} messages sent or attempted. Failures retry automatically.`} />
      <ListControls
        action={adminPaths.messages()} page={page} pages={Math.max(1, Math.ceil(total / 25))} hrefFor={(p) => adminPaths.messages({ status, page: p })} hideSearch
        filters={(
          <div className="grid gap-1"><label htmlFor="status" className="text-sm font-medium">Status</label>
            <select id="status" name="status" defaultValue={status ?? ''} className="adm-input"><option value="">All</option>{Object.entries(MESSAGE_STATUS_LABEL).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}</select></div>
        )}
      />
      <DataTable
        caption="Messages" rows={rows} rowKey={(m) => m.id} empty="No messages yet."
        columns={[
          { key: 'at', header: 'When', cell: (m) => new Date(m.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) },
          { key: 'customer', header: 'Customer', cell: (m) => m.customerName ?? '—' },
          { key: 'subject', header: 'Message', cell: (m) => (<details><summary className="adm-link cursor-pointer">{m.subject || m.templateKey || 'Message'}</summary>{m.body ? <pre className="mt-2 max-w-md whitespace-pre-wrap text-xs">{m.body}</pre> : null}</details>) },
          { key: 'channel', header: 'Channel', cell: (m) => `${m.channel} via ${m.provider}` },
          { key: 'status', header: 'Status', cell: (m) => (<><Badge tone={m.status === 'failed' ? 'danger' : m.status === 'sent' || m.status === 'delivered' ? 'success' : m.status === 'skipped' ? 'neutral' : 'info'}>{MESSAGE_STATUS_LABEL[m.status] ?? m.status}</Badge>{m.error ? <span className="adm-error ml-2 text-xs">{m.error}</span> : null}</>) },
        ]}
      />
    </main>
  );
}
