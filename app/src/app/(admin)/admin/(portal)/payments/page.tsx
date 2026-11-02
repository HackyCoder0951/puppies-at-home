import { billingMessage } from '@backend/modules/billing';
import { getBilling } from '@composition';
import { PaymentsView } from './PaymentsView';

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number.parseInt((await searchParams).page ?? '1', 10) || 1);
  const billing = await getBilling();
  const [ledger, pending] = await Promise.all([billing.listPayments(page), billing.pendingRefunds()]);
  if (!ledger.ok) return <p role="alert" className="adm-error">{billingMessage(ledger.error)}</p>;
  return <PaymentsView rows={ledger.value.rows} total={ledger.value.total} page={page} pending={pending.ok ? pending.value : []} />;
}
