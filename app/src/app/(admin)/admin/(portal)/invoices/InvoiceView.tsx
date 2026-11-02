import Link from 'next/link';
import { formatMoney, INVOICE_STATUS_LABEL, type InvoiceDetail } from '@backend/modules/billing';
import { adminPaths } from '@nav';
import { createPaymentLinkAction, issueInvoiceAction, updateDraftAction, voidInvoiceAction } from '../billing-actions';
import { ActionForm, TextField } from '../ActionForm';
import { PaymentForm } from '../PaymentForm';
import { PaymentList } from '../PaymentList';
import { InvoiceTotals } from './InvoiceTotals';

export function InvoiceView({ invoice: i, gateways }: { invoice: InvoiceDetail; gateways: readonly { id: string; name: string; mode: string }[] }) {
  const draft = i.status === 'draft';
  const open = i.status === 'issued' || i.status === 'partially_paid' || i.status === 'overdue';
  return (
    <main className="grid gap-6">
      <section className="adm-card grid gap-3" aria-labelledby="invoice">
        <h1 id="invoice" className="text-lg font-semibold">{i.number ?? 'Draft invoice'} · {INVOICE_STATUS_LABEL[i.status]}</h1>
        <p className="text-sm"><Link href={adminPaths.customer(i.customerId)} className="adm-link">{i.customerName}</Link> · <Link href={adminPaths.order(i.orderId)} className="adm-link">{i.orderNumber}</Link>{i.dueAt ? ` · due ${i.dueAt}` : ''}</p>
        {i.voidReason ? <p className="adm-error text-sm">Void: {i.voidReason}</p> : null}
        <InvoiceTotals invoice={i} />
        {!draft ? <Link href={adminPaths.invoicePrint(i.id)} className="adm-link text-sm">Open the print view (save as PDF from the browser)</Link> : null}
      </section>

      {draft ? (
        <section className="adm-card grid gap-3" aria-labelledby="draft">
          <h2 id="draft" className="font-medium">Draft</h2>
          <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>Lines come from the order and cannot be edited here. Issuing locks the invoice and gives it a number.</p>
          <ActionForm action={updateDraftAction.bind(null, i.id)} submitLabel="Save draft" className="grid gap-3 sm:grid-cols-2">
            <TextField name="dueAt" label="Due date" type="date" defaultValue={i.dueAt} required={false} />
            <TextField name="notes" label="Note on the invoice" defaultValue={i.notes} required={false} />
          </ActionForm>
          <ActionForm action={issueInvoiceAction.bind(null, i.id)} submitLabel="Issue invoice" className="grid gap-3 sm:grid-cols-2">
            <TextField name="dueAt" label="Due date (default 14 days)" type="date" defaultValue={i.dueAt} required={false} />
          </ActionForm>
        </section>
      ) : null}

      {open ? (
        <section className="adm-card grid gap-3" aria-labelledby="pay">
          <h2 id="pay" className="font-medium">Record a payment against this invoice</h2>
          <PaymentForm orderId={i.orderId} invoiceId={i.id} balanceMinor={i.totalMinor - i.paidMinor} />
        </section>
      ) : null}

      {open && gateways.length ? (
        <section className="adm-card grid gap-3" aria-labelledby="link">
          <h2 id="link" className="font-medium">Online payment link</h2>
          <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>The customer pays on the gateway&apos;s hosted page; nothing is recorded as paid until the gateway confirms. To email the link, use Send a message on the customer page with the payment_link template.</p>
          {gateways.map((g) => (
            <ActionForm key={g.id} action={createPaymentLinkAction.bind(null, i.id, g.id)} submitLabel={`Create ${g.name} link (${g.mode} mode)`} className="grid gap-2"><span /></ActionForm>
          ))}
        </section>
      ) : null}

      <section className="adm-card grid gap-3" aria-labelledby="payments">
        <h2 id="payments" className="font-medium">Payments ({formatMoney(i.paidMinor, i.currency)})</h2>
        <PaymentList payments={i.payments} canRefund />
      </section>

      {i.status !== 'void' && i.status !== 'paid' ? (
        <section className="adm-card grid gap-3" aria-labelledby="void">
          <h2 id="void" className="font-medium">Void this invoice</h2>
          <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>Super admins only. An invoice with payments cannot be voided.</p>
          <ActionForm action={voidInvoiceAction.bind(null, i.id)} submitLabel="Void invoice">
            <TextField name="reason" label="Reason" />
          </ActionForm>
        </section>
      ) : null}
    </main>
  );
}
