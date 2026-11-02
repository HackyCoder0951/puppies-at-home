import Link from 'next/link';
import { formatMoney, ORDER_STATUSES, ORDER_STATUS_LABEL, PAGE_SIZE, type OrderRow } from '@backend/modules/commerce';
import { adminPaths } from '@nav';
import { Badge, DataTable, PageHeader } from '@shared/ui/admin';
import { ListControls } from '../ListControls';
import { SavedViews } from '../shell/SavedViews';
import { OrderBoard } from './OrderBoard';
import { ORDER_TONE } from './orderTone';

/** Orders: board first (open orders by stage), table for search, history and closed orders. */
export function OrderList({ rows, total, page, status, q, view }: { rows: readonly OrderRow[]; total: number; page: number; status?: string; q?: string; view: 'board' | 'table' }) {
  const tab = (v: 'board' | 'table', label: string) => (
    <Link href={v === 'board' ? adminPaths.orders() : `${adminPaths.orders()}?view=table`} className={`adm-btn adm-btn-small ${view === v ? '' : 'adm-btn-secondary'}`} aria-current={view === v ? 'page' : undefined}>{label}</Link>
  );
  return (
    <main className="grid gap-4">
      <PageHeader title="Orders" description={view === 'board' ? `${rows.length} open orders by stage. Create an order from an enquiry or a customer record.` : `${total} orders`} actions={<>{tab('board', 'Board')}{tab('table', 'Table')}</>} />
      {view === 'board' ? <OrderBoard rows={rows} /> : (
        <>
          <ListControls
            action={adminPaths.orders()} hidden={{ view: 'table' }} q={q} page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} hrefFor={(p) => `${adminPaths.orders({ status, q, page: p })}${adminPaths.orders({ status, q, page: p }).includes('?') ? '&' : '?'}view=table`}
            filters={(
              <div className="grid gap-1">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select id="status" name="status" defaultValue={status ?? ''} className="adm-input"><option value="">All</option>{ORDER_STATUSES.map((s) => (<option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>))}</select>
              </div>
            )}
          />
          <SavedViews listKey="orders" />
          <DataTable
            id="orders-table" caption="Orders" rows={rows} rowKey={(o) => o.id} empty="No orders match."
            columns={[
              { key: 'number', header: 'Order', cell: (o) => <Link href={adminPaths.order(o.id)} className="adm-link font-semibold">{o.number}</Link> },
              { key: 'customer', header: 'Customer', cell: (o) => o.customerName },
              { key: 'puppy', header: 'Puppy', cell: (o) => o.puppyLabel ?? '—' },
              { key: 'type', header: 'Type', cell: (o) => (o.type === 'local' ? 'Local' : 'Imported') },
              { key: 'status', header: 'Status', cell: (o) => <Badge tone={ORDER_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge> },
              { key: 'total', header: 'Total', numeric: true, cell: (o) => formatMoney(o.totalMinor, o.currency) },
              { key: 'paid', header: 'Paid', numeric: true, cell: (o) => formatMoney(o.paidMinor, o.currency) },
            ]}
          />
        </>
      )}
    </main>
  );
}
