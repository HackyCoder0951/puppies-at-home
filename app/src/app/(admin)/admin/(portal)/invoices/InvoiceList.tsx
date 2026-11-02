import Link from 'next/link';
import { formatMoney, INVOICE_STATUSES, INVOICE_STATUS_LABEL, PAGE_SIZE, type InvoiceRow, type InvoiceStatus } from '@backend/modules/billing';
import { adminPaths } from '@nav';
import { Badge, DataTable, PageHeader, type Tone } from '@shared/ui/admin';
import { ListControls } from '../ListControls';

const TONE: Record<InvoiceStatus, Tone> = { draft: 'neutral', issued: 'info', partially_paid: 'warning', paid: 'success', overdue: 'danger', void: 'neutral' };
const DAY = 86_400_000;

/** "Due in 3 days", "5 days overdue": ageing in words, only for invoices that still owe money. */
function ageing(row: InvoiceRow, now: Date): string {
  if (!row.dueAt || row.status === 'paid' || row.status === 'void' || row.status === 'draft') return '—';
  const days = Math.ceil((new Date(row.dueAt).getTime() - now.getTime()) / DAY);
  return days < 0 ? `${-days} days overdue` : days === 0 ? 'Due today' : `Due in ${days} days`;
}

export function InvoiceList({ rows, total, page, status, now }: { rows: readonly InvoiceRow[]; total: number; page: number; status?: string; now: Date }) {
  const owed = rows.reduce((sum, r) => sum + (r.status === 'void' || r.status === 'draft' ? 0 : r.totalMinor - r.paidMinor), 0);
  return (
    <main className="grid gap-4">
      <PageHeader title="Invoices" description={`${total} invoices. Create one from an order.`} />
      <nav aria-label="Status filter" className="adm-attention">
        <Link href={adminPaths.invoices()} className="adm-chip" aria-current={!status ? 'page' : undefined}>All</Link>
        {INVOICE_STATUSES.map((s) => (<Link key={s} href={adminPaths.invoices({ status: s })} className="adm-chip" data-alert={s === 'overdue' ? 'true' : undefined} aria-current={status === s ? 'page' : undefined}>{INVOICE_STATUS_LABEL[s]}</Link>))}
      </nav>
      <DataTable
        id="invoices-table" caption="Invoices" rows={rows} rowKey={(i) => i.id} empty="No invoices match. Create one from an order."
        columns={[
          { key: 'n', header: 'Invoice', cell: (i) => <Link href={adminPaths.invoice(i.id)} className="adm-link font-semibold">{i.number ?? 'Draft'}</Link> },
          { key: 'c', header: 'Customer', cell: (i) => i.customerName },
          { key: 'o', header: 'Order', cell: (i) => i.orderNumber },
          { key: 's', header: 'Status', cell: (i) => <Badge tone={TONE[i.status]}>{INVOICE_STATUS_LABEL[i.status]}</Badge> },
          { key: 'a', header: 'Ageing', cell: (i) => ageing(i, now) },
          { key: 't', header: 'Total', numeric: true, cell: (i) => formatMoney(i.totalMinor, i.currency) },
          { key: 'p', header: 'Paid', numeric: true, cell: (i) => formatMoney(i.paidMinor, i.currency) },
        ]}
      />
      <p className="adm-muted text-sm">Still owed on this page: <strong className="num" style={{ color: 'var(--ink)' }}>{formatMoney(owed)}</strong>{total > PAGE_SIZE ? ` (page ${page} of ${Math.ceil(total / PAGE_SIZE)})` : ''}</p>
      <ListControls action={adminPaths.invoices()} hidden={status ? { status } : undefined} page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} hrefFor={(p) => adminPaths.invoices({ status, page: p })} hideSearch hideFilterButton />
    </main>
  );
}
