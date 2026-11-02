import { formatMoney, formatRate, type InvoiceDetail } from '@backend/modules/billing';

export function InvoiceTotals({ invoice: i }: { invoice: InvoiceDetail }) {
  const money = (v: number) => formatMoney(v, i.currency);
  const rate = i.lines[0]?.taxRateBps ?? 0;
  return (
    <table className="w-full text-sm">
      <thead><tr className="text-left"><th scope="col">Item</th><th scope="col">Qty</th><th scope="col" className="text-right">Price</th><th scope="col" className="text-right">VAT</th></tr></thead>
      <tbody>
        {i.lines.map((l, n) => (<tr key={n}><td>{l.description}</td><td>{l.quantity}</td><td className="text-right">{money(l.unitMinor * l.quantity)}</td><td className="text-right">{money(l.taxMinor)}</td></tr>))}
      </tbody>
      <tfoot>
        <tr><th scope="row" colSpan={3} className="pt-2 text-right">Subtotal</th><td className="pt-2 text-right">{money(i.subtotalMinor)}</td></tr>
        <tr><th scope="row" colSpan={3} className="text-right">VAT ({formatRate(rate)})</th><td className="text-right">{money(i.taxMinor)}</td></tr>
        <tr><th scope="row" colSpan={3} className="text-right">Total</th><td className="text-right font-semibold">{money(i.totalMinor)}</td></tr>
        <tr><th scope="row" colSpan={3} className="text-right">Paid</th><td className="text-right">{money(i.paidMinor)}</td></tr>
        <tr><th scope="row" colSpan={3} className="text-right">Balance due</th><td className="text-right">{money(i.totalMinor - i.paidMinor)}</td></tr>
      </tfoot>
    </table>
  );
}
