import Link from 'next/link';
import { formatMoney, PAGE_SIZE, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, type PaymentRow } from '@backend/modules/billing';
import { Badge, DataTable, PageHeader } from '@shared/ui/admin';
import { adminPaths } from '@nav';
import { decideRefundAction } from '../billing-actions';
import { ActionForm, SelectField, TextField } from '../ActionForm';

export function PaymentsView({ rows, total, page, pending }: { rows: readonly PaymentRow[]; total: number; page: number; pending: readonly (PaymentRow & { refundId: string })[] }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <main className="grid gap-6">
      <PageHeader title="Payments" description={`${total} payments in the ledger.`} />
      {pending.length ? (
        <section className="adm-card grid gap-3" aria-labelledby="refunds" style={{ borderColor: 'var(--danger)' }}>
          <h2 id="refunds" className="font-semibold">Refunds waiting for approval</h2>
          {pending.map((p) => (
            <ActionForm key={p.refundId} action={decideRefundAction.bind(null, p.refundId)} submitLabel="Save decision" className="grid gap-3 sm:grid-cols-3">
              <p className="text-sm sm:col-span-3">{p.orderNumber}: refund {formatMoney(p.refunds[0]?.amountMinor ?? 0, p.currency)} of {formatMoney(p.amountMinor, p.currency)}. {p.refunds[0]?.reason} ({p.refunds[0]?.requestedByName})</p>
              <SelectField name="decision" label="Decision" options={[{ value: 'approve', label: 'Approve (money is returned outside the system)' }, { value: 'reject', label: 'Reject' }]} />
              <TextField name="note" label="Note" required={false} />
            </ActionForm>
          ))}
        </section>
      ) : null}
      <DataTable
        id="payments-table" caption="Payments" rows={rows} rowKey={(p) => p.id} empty="No payments yet."
        columns={[
          { key: 'd', header: 'Date', cell: (p) => new Date(p.paidAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) },
          { key: 'o', header: 'Order', cell: (p) => <Link href={adminPaths.order(p.orderId)} className="adm-link">{p.orderNumber}</Link> },
          { key: 'i', header: 'Invoice', cell: (p) => p.invoiceNumber ?? '—' },
          { key: 'm', header: 'Method', cell: (p) => PAYMENT_METHOD_LABEL[p.method] },
          { key: 's', header: 'Status', cell: (p) => <Badge tone={p.status === 'succeeded' ? 'success' : p.status === 'failed' ? 'danger' : p.status === 'pending' ? 'warning' : 'neutral'}>{PAYMENT_STATUS_LABEL[p.status]}</Badge> },
          { key: 'r', header: 'Reference', cell: (p) => <span className="break-all">{p.reference}</span> },
          { key: 'a', header: 'Amount', numeric: true, cell: (p) => formatMoney(p.amountMinor, p.currency) },
        ]}
      />
      {pages > 1 ? (
        <nav aria-label="Pages" className="flex items-center gap-4 text-sm">
          {page > 1 ? <Link href={adminPaths.payments(page - 1)} className="adm-link">Previous</Link> : null}
          <span>Page {page} of {pages}</span>
          {page < pages ? <Link href={adminPaths.payments(page + 1)} className="adm-link">Next</Link> : null}
        </nav>
      ) : null}
    </main>
  );
}
