import type { CustomerOption, SellablePuppy } from '@backend/modules/commerce';
import { createOrderAction } from '../commerce-actions';
import { ActionForm, SelectField, TextField } from '../ActionForm';
import { ItemRows } from '../ItemRows';

export function OrderForm({ customer, puppies, puppyId, enquiryId }: { customer: CustomerOption; puppies: readonly SellablePuppy[]; puppyId?: string; enquiryId?: string }) {
  const puppy = puppies.find((p) => p.id === puppyId);
  return (
    <main className="adm-card grid gap-4">
      <h1 className="text-lg font-semibold">New order for {customer.fullName}</h1>
      <ActionForm action={createOrderAction} submitLabel="Create order">
        <input type="hidden" name="customerId" value={customer.id} />
        {enquiryId ? <input type="hidden" name="enquiryId" value={enquiryId} /> : null}
        <SelectField name="puppyId" label="Puppy (reserved when the order is created)" defaultValue={puppy?.id ?? ''} options={[{ value: '', label: 'No puppy (extras only)' }, ...puppies.map((p) => ({ value: p.id, label: p.label }))]} />
        <SelectField name="type" label="Type" defaultValue={puppy?.origin ?? 'local'} options={[{ value: 'local', label: 'Local (showroom or Dubai delivery)' }, { value: 'imported', label: 'Imported' }]} />
        <ItemRows first={puppy ? { description: puppy.label, price: puppy.priceMinor === null ? '' : String(puppy.priceMinor / 100) } : undefined} />
        <TextField name="deposit" label="Deposit (AED)" defaultValue="0" hint="Cannot exceed the total." />
        <div className="grid gap-1">
          <label htmlFor="notes" className="text-sm font-medium">Notes</label>
          <textarea id="notes" name="notes" rows={3} maxLength={2000} className="adm-input" />
        </div>
      </ActionForm>
    </main>
  );
}
