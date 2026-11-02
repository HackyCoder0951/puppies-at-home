import Link from 'next/link';
import type { ReactNode } from 'react';
import { canEditItems, DELIVERY_METHOD_LABEL, formatMoney, nextOrderStatuses, ORDER_STATUS_LABEL, type OrderDetail, type OrderStatus } from '@backend/modules/commerce';
import { adminPaths } from '@nav';
import { createDeliveryAction, orderNotesAction, orderStatusAction, setItemsAction } from '../commerce-actions';
import { Badge, PageHeader } from '@shared/ui/admin';
import { ActionForm, SelectField, TextField } from '../ActionForm';
import { ORDER_TONE } from './orderTone';
import { ItemRows } from '../ItemRows';
import { DeliveryCard } from './DeliveryCard';

const STAGE_ORDER: OrderStatus[] = ['new', 'confirmed', 'deposit_paid', 'preparing', 'in_transit', 'delivered', 'completed'];

export function OrderView({ order: o, children }: { order: OrderDetail; children?: ReactNode }) {
  const next = nextOrderStatuses(o.status, o.type);
  const money = (v: number) => formatMoney(v, o.currency);
  return (
    <main className="grid gap-6">
      <PageHeader title={o.number} description={<><Badge tone={ORDER_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge> {o.customerName} · {o.type === 'local' ? 'Local' : 'Imported'}</>} />
      <ol className="adm-stepper" aria-label="Order stages">
        {STAGE_ORDER.map((st) => (
          <li key={st} data-state={o.status === 'cancelled' ? undefined : st === o.status ? 'current' : STAGE_ORDER.indexOf(st) < STAGE_ORDER.indexOf(o.status) ? 'done' : undefined} aria-current={st === o.status ? 'step' : undefined}>{ORDER_STATUS_LABEL[st]}</li>
        ))}
      </ol>
      <section className="adm-card grid gap-2" aria-labelledby="order">
        <h2 id="order" className="font-semibold">Summary</h2>
        <p><Link href={adminPaths.customer(o.customerId)} className="adm-link">{o.customerName}</Link>{o.puppyLabel ? ` · ${o.puppyLabel}` : ''} · {o.type === 'local' ? 'Local' : 'Imported'}</p>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Money summary">
          {[['Items (before VAT)', o.totalMinor], ['Deposit', o.depositMinor], ['Paid', o.paidMinor], ['Balance', o.balanceMinor]].map(([label, value]) => (
            <div key={String(label)}><dt className="adm-muted text-xs font-semibold uppercase tracking-wide">{label}</dt><dd className="adm-figure" style={{ fontSize: 22 }}>{money(Number(value))}</dd></div>
          ))}
        </dl>
        {o.cancelReason ? <p className="adm-error text-sm">Cancelled: {o.cancelReason}</p> : null}
      </section>

      {next.length ? (
        <section className="adm-card grid gap-3" aria-labelledby="status">
          <h2 id="status" className="font-medium">Move this order</h2>
          <ActionForm action={orderStatusAction.bind(null, o.id)} submitLabel="Update status" className="grid gap-3 sm:grid-cols-2">
            <SelectField name="to" label="Next status" options={next.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] }))} />
            <TextField name="reason" label="Reason (required to cancel)" required={false} />
          </ActionForm>
        </section>
      ) : null}

      <section className="adm-card grid gap-3" aria-labelledby="items">
        <h2 id="items" className="font-medium">Items</h2>
        {canEditItems(o.status) ? (
          <ActionForm action={setItemsAction.bind(null, o.id)} submitLabel="Save items">
            <ItemRows items={o.items} />
            <TextField name="deposit" label="Deposit (AED)" defaultValue={String(o.depositMinor / 100)} />
          </ActionForm>
        ) : (
          <ul className="grid gap-1 text-sm">{o.items.map((i, n) => (<li key={n}>{i.quantity} × {i.description}: {money(i.unitMinor * i.quantity)}</li>))}</ul>
        )}
      </section>

      {children}

      <section className="grid gap-3" aria-labelledby="deliveries">
        <h2 id="deliveries" className="font-medium">Deliveries</h2>
        {o.deliveries.map((d) => (<DeliveryCard key={d.id} delivery={d} />))}
        {o.status !== 'cancelled' && o.status !== 'completed' ? (
          <div className="adm-card grid gap-3">
            <h3 className="font-medium">Schedule a delivery</h3>
            <ActionForm action={createDeliveryAction.bind(null, o.id)} submitLabel="Schedule" className="grid gap-3 sm:grid-cols-2">
              <SelectField name="method" label="Method" options={Object.entries(DELIVERY_METHOD_LABEL).map(([value, label]) => ({ value, label }))} />
              <TextField name="eta" label="Expected date" type="date" required={false} />
              <TextField name="carrier" label="Carrier" required={false} />
              <TextField name="trackingNo" label="Tracking number" required={false} />
              <TextField name="addressText" label="Address" required={false} />
            </ActionForm>
          </div>
        ) : null}
      </section>

      <section className="adm-card grid gap-3" aria-labelledby="notes">
        <h2 id="notes" className="font-medium">Notes</h2>
        <ActionForm action={orderNotesAction.bind(null, o.id, o.assignedTo)} submitLabel="Save notes">
          <textarea name="notes" aria-label="Order notes" defaultValue={o.notes ?? ''} rows={3} maxLength={2000} className="adm-input" />
        </ActionForm>
      </section>

      <section className="adm-card grid gap-2" aria-labelledby="timeline">
        <h2 id="timeline" className="font-medium">Timeline</h2>
        <ol className="grid gap-1 text-sm">
          {o.events.map((e) => (
            <li key={e.id}>{e.from ? `${ORDER_STATUS_LABEL[e.from]} → ` : ''}<strong>{ORDER_STATUS_LABEL[e.to]}</strong>{e.reason ? `: ${e.reason}` : ''} <span style={{ color: 'var(--adm-muted)' }}>({e.actorName}, {new Date(e.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })})</span></li>
          ))}
        </ol>
      </section>
    </main>
  );
}
