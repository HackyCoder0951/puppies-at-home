import { authorityHoursLeft, type IncidentRow } from '@backend/modules/privacy';
import { createIncidentAction, updateIncidentAction } from '../privacy-actions';
import { ActionForm, SelectField, TextField } from '../ActionForm';

const RISK = ['unknown', 'low', 'medium', 'high'].map((v) => ({ value: v, label: v }));
const STATUS = ['open', 'contained', 'closed'].map((v) => ({ value: v, label: v }));

export function IncidentList({ rows, now }: { rows: readonly IncidentRow[]; now: Date }) {
  return (
    <section className="grid gap-3" aria-labelledby="incidents">
      <h2 id="incidents" className="text-lg font-semibold">Breach register</h2>
      <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>Record every suspected incident, even if nobody is notified. Notify the authority within 72 hours of becoming aware where there is a risk to people.</p>
      {rows.map((i) => {
        const left = authorityHoursLeft(i.awareAt, now);
        return (
          <article key={i.id} className="adm-card grid gap-2" aria-label={i.summary}>
            <h3 className="font-medium">{i.summary}</h3>
            <p className="text-sm" style={!i.authorityNotifiedAt && i.status === 'open' && left < 12 ? { color: 'var(--adm-danger)' } : { color: 'var(--adm-muted)' }}>
              {i.status} · risk {i.riskLevel} · aware {new Date(i.awareAt).toLocaleString('en-GB')}{i.authorityNotifiedAt ? ' · authority notified' : left >= 0 ? ` · ${left} h left to decide on notifying the authority` : ` · ${-left} h past the 72-hour window`}
            </p>
            <ActionForm action={updateIncidentAction.bind(null, i.id)} submitLabel="Update" className="grid gap-3 sm:grid-cols-2">
              <SelectField name="status" label="Status" defaultValue={i.status} options={STATUS} />
              <SelectField name="riskLevel" label="Risk" defaultValue={i.riskLevel} options={RISK} />
              <TextField name="authorityNotifiedAt" label="Authority notified at" type="datetime-local" required={false} />
              <TextField name="individualsNotifiedAt" label="People notified at" type="datetime-local" required={false} />
              <TextField name="decisionReason" label="Decision and reasons" defaultValue={i.decisionReason} required={false} />
            </ActionForm>
          </article>
        );
      })}
      <div className="adm-card grid gap-3">
        <h3 className="font-medium">Record an incident</h3>
        <ActionForm action={createIncidentAction} submitLabel="Record" className="grid gap-3 sm:grid-cols-2">
          <TextField name="detectedAt" label="Detected" type="datetime-local" />
          <TextField name="awareAt" label="Became aware" type="datetime-local" />
          <TextField name="summary" label="What happened" />
          <TextField name="dataCategories" label="Data involved (comma separated)" required={false} />
          <TextField name="peopleAffected" label="People affected (if known)" type="number" required={false} />
          <SelectField name="riskLevel" label="Risk" options={RISK} />
        </ActionForm>
      </div>
    </section>
  );
}
