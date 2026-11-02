import { notFound } from 'next/navigation';
import { billingMessage } from '@backend/modules/billing';
import { getBilling } from '@composition';
import { InvoiceView } from '../InvoiceView';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const billing = await getBilling();
  const result = await billing.getInvoice((await params).id);
  if (!result.ok) {
    if (result.error.code === 'not-found') notFound();
    return <p role="alert" className="adm-error">{billingMessage(result.error)}</p>;
  }
  return <InvoiceView invoice={result.value} gateways={billing.paymentGateways()} />;
}
