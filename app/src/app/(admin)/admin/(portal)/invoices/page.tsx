import { billingMessage, INVOICE_STATUSES, type InvoiceStatus } from '@backend/modules/billing';
import { getBilling } from '@composition';
import { currentTime } from '../privacy/now';
import { InvoiceList } from './InvoiceList';

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const sp = await searchParams;
  const status = INVOICE_STATUSES.find((s) => s === sp.status) as InvoiceStatus | undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const result = await (await getBilling()).listInvoices({ status, page });
  if (!result.ok) return <p role="alert" className="adm-error">{billingMessage(result.error)}</p>;
  return <InvoiceList rows={result.value.rows} total={result.value.total} page={page} status={status} now={currentTime()} />;
}
