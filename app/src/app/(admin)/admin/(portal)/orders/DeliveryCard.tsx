import { DELIVERY_METHOD_LABEL, DELIVERY_STATUS_LABEL, nextDeliveryStatuses, type DeliveryRow } from '@backend/modules/commerce';
import { deliveryStatusAction } from '../commerce-actions';
import { ActionForm, SelectField, TextField } from '../ActionForm';

export function DeliveryCard({ delivery: d }: { delivery: DeliveryRow }) {
  const next = nextDeliveryStatuses(d.status);
  return (
    <article className="adm-card grid gap-3" aria-label={`Delivery ${DELIVERY_METHOD_LABEL[d.method]}`}>
      <h3 className="font-medium">{DELIVERY_METHOD_LABEL[d.method]} · {DELIVERY_STATUS_LABEL[d.status]}</h3>
      <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>{[d.carrier, d.trackingNo && `Tracking ${d.trackingNo}`, d.eta && `ETA ${d.eta}`, d.addressText].filter(Boolean).join(' · ') || 'No details yet'}</p>
      <ol className="grid gap-1 text-sm">
        {d.events.map((e) => (
          <li key={e.id}>{DELIVERY_STATUS_LABEL[e.status]}{e.location ? `, ${e.location}` : ''}{e.note ? `: ${e.note}` : ''} <span style={{ color: 'var(--adm-muted)' }}>({new Date(e.occurredAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })})</span></li>
        ))}
      </ol>
      {next.length ? (
        <ActionForm action={deliveryStatusAction.bind(null, d.id)} submitLabel="Update delivery" className="grid gap-3 sm:grid-cols-3">
          <SelectField name="to" label="Move to" options={next.map((s) => ({ value: s, label: DELIVERY_STATUS_LABEL[s] }))} />
          <TextField name="location" label="Location" required={false} />
          <TextField name="note" label="Note (needed if failed)" required={false} />
        </ActionForm>
      ) : null}
    </article>
  );
}
