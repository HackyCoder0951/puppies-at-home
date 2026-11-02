import { REQUEST_STATUSES, REQUEST_STATUS_LABEL, REQUEST_TYPES, REQUEST_TYPE_LABEL, daysUntil, type RequestRow } from '@backend/modules/privacy';
import Link from 'next/link';
import { adminPaths } from '@nav';
import { createRequestAction, updateRequestAction } from '../privacy-actions';
import { ActionForm, SelectField, TextField } from '../ActionForm';


export function RequestList({ rows, now }: { rows: readonly RequestRow[]; now: Date }) {
  return (
    <section className="grid gap-3" aria-labelledby="requests">
      <h2 id="requests" className="text-lg font-semibold">Data subject requests</h2>
      <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>Reply within 30 days. Verify identity first, never ask for more than needed, and record any legal exception.</p>
      {rows.map((r) => {
        const days = daysUntil(r.dueAt, now);
        const open = r.status !== 'completed' && r.status !== 'rejected';
        return (
          <article key={r.id} className="adm-card grid gap-2" aria-label={`${REQUEST_TYPE_LABEL[r.type]} from ${r.requesterName}`}>
            <h3 className="font-medium">{REQUEST_TYPE_LABEL[r.type]}: {r.requesterName} ({r.contact})</h3>
            <p className="text-sm" style={open && days < 0 ? { color: 'var(--adm-danger)' } : { color: 'var(--adm-muted)' }}>{REQUEST_STATUS_LABEL[r.status]}{open ? ` · ${days < 0 ? `${-days} day(s) overdue` : `${days} day(s) left`}` : ''}{r.identityVerifiedAt ? ' · identity verified' : ''}</p>
            {r.details ? <p className="text-sm">{r.details}</p> : null}
            {r.subjectRef !== 'unmatched' ? <Link href={adminPaths.privacySubject(r.subjectRef)} className="adm-link text-sm">Open the customer&apos;s privacy tools</Link> : <p className="text-sm">No customer record matched.</p>}
            <ActionForm action={updateRequestAction.bind(null, r.id)} submitLabel="Update" className="grid gap-3 sm:grid-cols-2">
              <SelectField name="status" label="Status" defaultValue={r.status} options={REQUEST_STATUSES.map((s) => ({ value: s, label: REQUEST_STATUS_LABEL[s] ?? s }))} />
              <TextField name="exceptions" label="Exceptions (legal retention, claims)" defaultValue={r.exceptions} required={false} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="verified" defaultChecked={Boolean(r.identityVerifiedAt)} /> Identity verified</label>
            </ActionForm>
          </article>
        );
      })}
      <div className="adm-card grid gap-3">
        <h3 className="font-medium">Log a request</h3>
        <ActionForm action={createRequestAction} submitLabel="Log request" className="grid gap-3 sm:grid-cols-2">
          <SelectField name="type" label="Type" options={REQUEST_TYPES.map((t) => ({ value: t, label: REQUEST_TYPE_LABEL[t] ?? t }))} />
          <TextField name="requester" label="Requester name" />
          <TextField name="contact" label="Email or phone" />
          <TextField name="customerId" label="Customer id (if known)" required={false} />
          <TextField name="details" label="What they asked" required={false} />
        </ActionForm>
      </div>
    </section>
  );
}
