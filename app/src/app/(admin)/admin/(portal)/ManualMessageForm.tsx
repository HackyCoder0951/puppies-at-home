import type { TemplateGroup } from '@backend/modules/messaging';
import { sendManualAction } from './messaging-actions';
import { ActionForm, SelectField } from './ActionForm';

/** Send a template to a customer by email (queued through the outbox) or get a prefilled WhatsApp link. */
export function ManualMessageForm({ customerId, orderId, templates }: { customerId: string; orderId: string | null; templates: readonly TemplateGroup[] }) {
  const options = templates.map((t) => ({ value: t.key, label: `${t.key} (${t.channel})` }));
  return (
    <ActionForm action={sendManualAction.bind(null, customerId, orderId)} submitLabel="Send" className="grid gap-3 sm:grid-cols-2">
      <SelectField name="template" label="Template" options={options} />
      <SelectField name="channel" label="Channel" options={[{ value: 'email', label: 'Email' }, { value: 'whatsapp', label: 'WhatsApp link' }]} />
    </ActionForm>
  );
}
