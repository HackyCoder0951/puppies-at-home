import { formatRate, type TaxRate } from '@backend/modules/billing';
import { setTaxRateAction } from '../billing-actions';
import { ActionForm, TextField } from '../ActionForm';

export function TaxRateForm({ rates, gateways }: { rates: readonly TaxRate[]; gateways: readonly { id: string; name: string; mode: string }[] }) {
  const current = rates.find((r) => r.isDefault);
  return (
    <section className="adm-card grid gap-4" aria-labelledby="tax">
      <h2 id="tax" className="text-lg font-semibold">VAT</h2>
      <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>Added on top of item prices. Current rate: {current ? `${current.name} (${formatRate(current.rateBps)})` : 'none'}. Orders keep the rate they were created with. Confirm the correct rate and registration with your accountant. Only a super admin can save.</p>
      <ActionForm action={setTaxRateAction} submitLabel="Set new default rate" className="grid gap-3 sm:grid-cols-2">
        <TextField name="name" label="Name" defaultValue={current?.name ?? 'UAE VAT'} />
        <TextField name="percent" label="Rate (%)" defaultValue={current ? String(current.rateBps / 100) : '5'} />
      </ActionForm>
      <h2 className="text-lg font-semibold">Payment gateways</h2>
      <p className="text-sm">Manual payments (cash, bank transfer, card machine) are always available.{' '}
        {gateways.length ? gateways.map((g) => `${g.name} is enabled in ${g.mode} mode (webhook: /api/webhooks/${g.id}).`).join(' ') : 'No online gateway is configured; set PAYMENT_GATEWAYS and the gateway keys to enable one.'}</p>
    </section>
  );
}
