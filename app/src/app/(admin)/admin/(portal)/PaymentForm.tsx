import { PAYMENT_METHODS, PAYMENT_METHOD_LABEL } from '@backend/modules/billing';
import { recordPaymentAction } from './billing-actions';
import { ActionForm, SelectField, TextField } from './ActionForm';

/** Record a manual payment. The suggested reference is a fresh idempotency key; replace it with a receipt number if there is one. */
export function PaymentForm({ orderId, invoiceId, balanceMinor }: { orderId: string; invoiceId: string | null; balanceMinor: number }) {
  return (
    <ActionForm action={recordPaymentAction.bind(null, orderId, invoiceId)} submitLabel="Record payment" className="grid gap-3 sm:grid-cols-2">
      <TextField name="amount" label="Amount (AED)" defaultValue={balanceMinor > 0 ? String(balanceMinor / 100) : ''} />
      <SelectField name="method" label="Method" options={PAYMENT_METHODS.filter((m) => m !== 'card' && m !== 'link').map((m) => ({ value: m, label: PAYMENT_METHOD_LABEL[m] }))} />
      <TextField name="reference" label="Reference (receipt or transfer number)" defaultValue={`pay-${crypto.randomUUID()}`} hint="Recording the same reference twice changes nothing." />
      <TextField name="note" label="Note" required={false} />
    </ActionForm>
  );
}
