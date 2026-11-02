import { notFound } from 'next/navigation';
import { billingMessage } from '@backend/modules/billing';
import { getBilling } from '@composition';
import { InvoiceTotals } from '../../InvoiceTotals';

/** Print-friendly invoice (the portal navigation is hidden when printing). Save as PDF from the browser. */
export default async function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const result = await (await getBilling()).getInvoice((await params).id);
  if (!result.ok) {
    if (result.error.code === 'not-found') notFound();
    return <p role="alert" className="adm-error">{billingMessage(result.error)}</p>;
  }
  const i = result.value;
  return (
    <main className="adm-card grid gap-4 print:border-0">
      <h1 className="text-xl font-semibold">Invoice {i.number ?? '(draft)'}</h1>
      <p className="text-sm">TeddyPups U.A.E. · Downtown Dubai, United Arab Emirates<br />Billed to {i.customerName} · Order {i.orderNumber}{i.issuedAt ? ` · Issued ${new Date(i.issuedAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}` : ''}{i.dueAt ? ` · Due ${i.dueAt}` : ''}</p>
      <InvoiceTotals invoice={i} />
      {i.notes ? <p className="text-sm">{i.notes}</p> : null}
      <p className="text-sm print:hidden" style={{ color: 'var(--adm-muted)' }}>Use your browser&apos;s print command (Ctrl or Cmd + P) and choose Save as PDF.</p>
    </main>
  );
}
