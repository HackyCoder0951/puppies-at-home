import Link from 'next/link';
import { formatMoney, INVOICE_STATUS_LABEL, type OrderMoney } from '@backend/modules/billing';
import type { OrderDetail } from '@backend/modules/commerce';
import { adminPaths } from '@nav';
import { createInvoiceAction } from '../billing-actions';
import { ActionForm, TextField } from '../ActionForm';
import { PaymentForm } from '../PaymentForm';
import { PaymentList } from '../PaymentList';

export function MoneySection({ order: o, money }: { order: OrderDetail; money: OrderMoney }) {
  const open = money.invoices.find((i) => i.status === 'issued' || i.status === 'partially_paid' || i.status === 'overdue');
  const canPay = o.status !== 'new' && o.status !== 'cancelled' && o.balanceMinor > 0;
  return (
    <section className="adm-card grid gap-4" aria-labelledby="money">
      <h2 id="money" className="font-medium">Invoices and payments</h2>
      <ul className="grid gap-1 text-sm">
        {money.invoices.map((i) => (
          <li key={i.id}><Link href={adminPaths.invoice(i.id)} className="adm-link">{i.number ?? 'Draft invoice'}</Link> · {INVOICE_STATUS_LABEL[i.status]} · {formatMoney(i.totalMinor, i.currency)}</li>
        ))}
        {money.invoices.length === 0 ? <li style={{ color: 'var(--adm-muted)' }}>No invoices yet.</li> : null}
      </ul>
      {o.status !== 'cancelled' && !money.invoices.some((i) => i.status !== 'void') ? (
        <ActionForm action={createInvoiceAction.bind(null, o.id)} submitLabel="Create invoice" className="grid gap-3 sm:grid-cols-2">
          <TextField name="dueAt" label="Due date" type="date" required={false} />
          <TextField name="notes" label="Note on the invoice" required={false} />
        </ActionForm>
      ) : null}
      <PaymentList payments={money.payments} canRefund />
      {canPay ? <PaymentForm orderId={o.id} invoiceId={open?.id ?? null} balanceMinor={o.balanceMinor} /> : null}
    </section>
  );
}
