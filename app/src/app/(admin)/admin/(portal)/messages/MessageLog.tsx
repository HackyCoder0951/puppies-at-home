import type { MessageRow } from '@backend/modules/messaging';
import { MESSAGE_STATUS_LABEL } from '@backend/modules/messaging';
import { adminPaths } from '@nav';
import { ListControls } from '../ListControls';

export function MessageLog({ rows, total, page, status }: { rows: readonly MessageRow[]; total: number; page: number; status?: string }) {
  return (
    <main className="grid gap-4">
      <h1 className="text-lg font-semibold">Message log <span className="text-sm font-normal" style={{ color: 'var(--adm-muted)' }}>({total})</span></h1>
      <ListControls
        action={adminPaths.messages()}
        page={page}
        pages={Math.max(1, Math.ceil(total / 25))}
        hrefFor={(p) => adminPaths.messages({ status, page: p })}
        hideSearch
        filters={
          <div className="grid gap-1">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <select id="status" name="status" defaultValue={status ?? ''} className="adm-input">
              <option value="">All</option>
              {Object.entries(MESSAGE_STATUS_LABEL).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
            </select>
          </div>
        }
      />
      {rows.length === 0 ? <p className="adm-card text-sm">No messages yet.</p> : null}
      <ul className="grid gap-3">
        {rows.map((m) => (
          <li key={m.id} className="adm-card grid gap-1">
            <span className="font-medium">{m.subject || m.templateKey || 'Message'} · {MESSAGE_STATUS_LABEL[m.status] ?? m.status}</span>
            <span className="text-sm" style={{ color: 'var(--adm-muted)' }}>{m.channel} via {m.provider}{m.to ? ` to ${m.to}` : ''}{m.customerName ? ` · ${m.customerName}` : ''} · {new Date(m.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            {m.error ? <span className="adm-error text-sm">{m.error}</span> : null}
            {m.body ? <details><summary className="adm-link cursor-pointer text-sm">Show text</summary><pre className="mt-2 whitespace-pre-wrap text-sm">{m.body}</pre></details> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
