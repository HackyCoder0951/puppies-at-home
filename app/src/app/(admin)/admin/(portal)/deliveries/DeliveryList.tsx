import Link from 'next/link';
import { DELIVERY_METHOD_LABEL, DELIVERY_STATUS_LABEL, type DeliveryRow, type DeliveryStatus } from '@backend/modules/commerce';
import { adminPaths } from '@nav';
import { Badge, DataTable, PageHeader, type Tone } from '@shared/ui/admin';

const TONE: Record<DeliveryStatus, Tone> = { scheduled: 'info', packed: 'info', dispatched: 'accent', in_transit: 'warning', arrived: 'success', delivered: 'success', delayed: 'danger', failed: 'danger' };
const day = (d: Date) => d.toISOString().slice(0, 10);

/** Open deliveries with a seven-day strip: how many are expected each day, and which have no date yet. */
export function DeliveryList({ rows, now }: { rows: readonly DeliveryRow[]; now: Date }) {
  const days = Array.from({ length: 7 }, (_, i) => day(new Date(now.getTime() + i * 86_400_000)));
  const count = (d: string) => rows.filter((r) => r.eta === d).length;
  const late = rows.filter((r) => r.eta && r.eta < days[0]!).length;
  return (
    <main className="grid gap-4">
      <PageHeader title="Deliveries" description={`${rows.length} open. Earliest first.`} />
      <ul className="adm-attention" aria-label="Next seven days">
        {late > 0 ? <li className="adm-chip" data-alert="true"><strong>{late}</strong> past their date</li> : null}
        {days.map((d, i) => (<li key={d} className="adm-chip"><strong>{count(d)}</strong> {i === 0 ? 'today' : new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</li>))}
        <li className="adm-chip"><strong>{rows.filter((r) => !r.eta).length}</strong> without a date</li>
      </ul>
      <DataTable
        caption="Open deliveries" rows={rows} rowKey={(d) => d.id} empty="Nothing is waiting for delivery."
        columns={[
          { key: 'order', header: 'Order', cell: (d) => <Link href={adminPaths.order(d.orderId)} className="adm-link font-semibold">{d.orderNumber}</Link> },
          { key: 'customer', header: 'Customer', cell: (d) => d.customerName ?? '—' },
          { key: 'method', header: 'Method', cell: (d) => DELIVERY_METHOD_LABEL[d.method] },
          { key: 'status', header: 'Status', cell: (d) => <Badge tone={TONE[d.status]}>{DELIVERY_STATUS_LABEL[d.status]}</Badge> },
          { key: 'eta', header: 'Expected', cell: (d) => d.eta ?? '—' },
          { key: 'carrier', header: 'Carrier', cell: (d) => d.carrier ?? '—' },
        ]}
      />
    </main>
  );
}
