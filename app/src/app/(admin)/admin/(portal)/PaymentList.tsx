import { formatMoney, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, REFUND_STATUS_LABEL, type PaymentRow } from '@backend/modules/billing';
import { requestRefundAction } from './billing-actions';
import { ActionForm, TextField } from './ActionForm';

export function PaymentList({ payments, canRefund }: { payments: readonly PaymentRow[]; canRefund: boolean }) {
  if (payments.length === 0) return <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>No payments yet.</p>;
  return (
    <ul className="grid gap-3">
      {payments.map((p) => (
        <li key={p.id} className="grid gap-1 text-sm">
          <span><strong>{formatMoney(p.amountMinor, p.currency)}</strong> · {PAYMENT_METHOD_LABEL[p.method]} · {PAYMENT_STATUS_LABEL[p.status]} · {new Date(p.paidAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
          <span style={{ color: 'var(--adm-muted)' }}>{p.orderNumber}{p.invoiceNumber ? ` · ${p.invoiceNumber}` : ''} · ref {p.reference}{p.recordedByName ? ` · ${p.recordedByName}` : ''}</span>
          {p.refunds.map((r) => (<span key={r.id}>Refund {formatMoney(r.amountMinor, p.currency)}: {REFUND_STATUS_LABEL[r.status]} ({r.reason}; {r.requestedByName}{r.decidedByName ? `, decided by ${r.decidedByName}` : ''})</span>))}
          {canRefund && (p.status === 'succeeded' || p.status === 'partially_refunded') ? (
            <details>
              <summary className="adm-link cursor-pointer">Request a refund</summary>
              <ActionForm action={requestRefundAction.bind(null, p.id)} submitLabel="Request refund" className="mt-2 grid gap-3 sm:grid-cols-2">
                <TextField name="amount" label="Amount (AED)" />
                <TextField name="reason" label="Reason" />
              </ActionForm>
            </details>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
