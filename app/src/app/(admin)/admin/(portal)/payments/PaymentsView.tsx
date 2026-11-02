import Link from 'next/link';
import { formatMoney, PAGE_SIZE, type PaymentRow } from '@backend/modules/billing';
import { adminPaths } from '@nav';
import { decideRefundAction } from '../billing-actions';
import { ActionForm, SelectField, TextField } from '../ActionForm';
import { PaymentList } from '../PaymentList';

export function PaymentsView({ rows, total, page, pending }: { rows: readonly PaymentRow[]; total: number; page: number; pending: readonly (PaymentRow & { refundId: string })[] }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <main className="grid gap-6">
      {pending.length ? (
        <section className="adm-card grid gap-3" aria-labelledby="refunds">
          <h2 id="refunds" className="font-medium">Refunds waiting for approval</h2>
          {pending.map((p) => (
            <ActionForm key={p.refundId} action={decideRefundAction.bind(null, p.refundId)} submitLabel="Save decision" className="grid gap-3 sm:grid-cols-3">
              <p className="text-sm sm:col-span-3">{p.orderNumber}: refund {formatMoney(p.refunds[0]?.amountMinor ?? 0, p.currency)} of {formatMoney(p.amountMinor, p.currency)}. {p.refunds[0]?.reason} ({p.refunds[0]?.requestedByName})</p>
              <SelectField name="decision" label="Decision" options={[{ value: 'approve', label: 'Approve (money is returned outside the system)' }, { value: 'reject', label: 'Reject' }]} />
              <TextField name="note" label="Note" required={false} />
            </ActionForm>
          ))}
        </section>
      ) : null}
      <section className="adm-card grid gap-3" aria-labelledby="ledger">
        <h1 id="ledger" className="text-lg font-semibold">Payments ({total})</h1>
        <PaymentList payments={rows} canRefund />
        {pages > 1 ? (
          <nav aria-label="Pages" className="flex items-center gap-4 text-sm">
            {page > 1 ? <Link href={adminPaths.payments(page - 1)} className="adm-link">Previous</Link> : null}
            <span>Page {page} of {pages}</span>
            {page < pages ? <Link href={adminPaths.payments(page + 1)} className="adm-link">Next</Link> : null}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
