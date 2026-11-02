import Link from 'next/link';
import { formatMoney, ORDER_STATUSES, ORDER_STATUS_LABEL, PAGE_SIZE, type OrderRow } from '@backend/modules/commerce';
import { adminPaths } from '@nav';
import { ListControls } from '../ListControls';

export function OrderList({ rows, total, page, status, q }: { rows: readonly OrderRow[]; total: number; page: number; status?: string; q?: string }) {
  return (
    <main className="grid gap-4">
      <h1 className="text-lg font-semibold">Orders <span className="text-sm font-normal" style={{ color: 'var(--adm-muted)' }}>({total})</span></h1>
      <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>Create an order from an enquiry or a customer record.</p>
      <ListControls
        action={adminPaths.orders()}
        q={q}
        page={page}
        pages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        hrefFor={(p) => adminPaths.orders({ status, q, page: p })}
        filters={
          <div className="grid gap-1">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <select id="status" name="status" defaultValue={status ?? ''} className="adm-input">
              <option value="">All</option>
              {ORDER_STATUSES.map((s) => (<option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>))}
            </select>
          </div>
        }
      />
      {rows.length === 0 ? <p className="adm-card text-sm">No orders match.</p> : null}
      <ul className="grid gap-3">
        {rows.map((o) => (
          <li key={o.id} className="adm-card grid gap-1">
            <Link href={adminPaths.order(o.id)} className="adm-link font-medium">{o.number} · {o.customerName}</Link>
            <span className="text-sm" style={{ color: 'var(--adm-muted)' }}>{ORDER_STATUS_LABEL[o.status]} · {o.type === 'local' ? 'Local' : 'Imported'}{o.puppyLabel ? ` · ${o.puppyLabel}` : ''} · {formatMoney(o.totalMinor, o.currency)}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
