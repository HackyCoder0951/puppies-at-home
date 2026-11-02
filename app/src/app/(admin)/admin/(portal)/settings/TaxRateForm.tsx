import { formatRate, type TaxRate } from '@backend/modules/billing';
import { setTaxRateAction } from '../billing-actions';
import { ActionForm, TextField } from '../ActionForm';

export function TaxRateForm({ rates }: { rates: readonly TaxRate[] }) {
  const current = rates.find((r) => r.isDefault);
  return (
    <section className="adm-card grid gap-4" aria-labelledby="tax">
      <h2 id="tax" className="text-lg font-semibold">VAT</h2>
      <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>Added on top of item prices. Current rate: {current ? `${current.name} (${formatRate(current.rateBps)})` : 'none'}. Orders keep the rate they were created with. Confirm the correct rate and registration with your accountant. Only a super admin can save.</p>
      <ActionForm action={setTaxRateAction} submitLabel="Set new default rate" className="grid gap-3 sm:grid-cols-2">
        <TextField name="name" label="Name" defaultValue={current?.name ?? 'UAE VAT'} />
        <TextField name="percent" label="Rate (%)" defaultValue={current ? String(current.rateBps / 100) : '5'} />
      </ActionForm>
    </section>
  );
}
