import Link from 'next/link';
import { formatMoney, INVOICE_STATUSES, INVOICE_STATUS_LABEL, PAGE_SIZE, type InvoiceRow } from '@backend/modules/billing';
import { adminPaths } from '@nav';
import { ListControls } from '../ListControls';

export function InvoiceList({ rows, total, page, status }: { rows: readonly InvoiceRow[]; total: number; page: number; status?: string }) {
  return (
    <main className="grid gap-4">
      <h1 className="text-lg font-semibold">Invoices <span className="text-sm font-normal" style={{ color: 'var(--adm-muted)' }}>({total})</span></h1>
      <ListControls
        action={adminPaths.invoices()}
        page={page}
        pages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        hrefFor={(p) => adminPaths.invoices({ status, page: p })}
        filters={
          <div className="grid gap-1">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <select id="status" name="status" defaultValue={status ?? ''} className="adm-input">
              <option value="">All</option>
              {INVOICE_STATUSES.map((s) => (<option key={s} value={s}>{INVOICE_STATUS_LABEL[s]}</option>))}
            </select>
          </div>
        }
        hideSearch
      />
      {rows.length === 0 ? <p className="adm-card text-sm">No invoices match. Create one from an order.</p> : null}
      <ul className="grid gap-3">
        {rows.map((i) => (
          <li key={i.id} className="adm-card grid gap-1">
            <Link href={adminPaths.invoice(i.id)} className="adm-link font-medium">{i.number ?? 'Draft'} · {i.customerName}</Link>
            <span className="text-sm" style={{ color: 'var(--adm-muted)' }}>{INVOICE_STATUS_LABEL[i.status]} · {i.orderNumber} · {formatMoney(i.totalMinor, i.currency)} (paid {formatMoney(i.paidMinor, i.currency)}){i.dueAt ? ` · due ${i.dueAt}` : ''}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
