import Link from 'next/link';
import { ENQUIRY_STATUSES, SOURCE_LABEL, STATUS_LABEL, whatsappLinkFor, type EnquiryDetail, type StaffOption } from '@backend/modules/inbox';
import { adminPaths } from '@nav';
import { ActionForm, SelectField } from '../ActionForm';
import { addNoteAction, assignEnquiryAction, enquiryStatusAction } from '../inbox-actions';

export function EnquiryView({ enquiry: e, staff }: { enquiry: EnquiryDetail; staff: readonly StaffOption[] }) {
  const wa = whatsappLinkFor(e.phone, `Hi ${e.name}, this is TeddyPups U.A.E. replying to your enquiry.`);
  return (
    <main className="grid gap-6">
      <section className="adm-card grid gap-2" aria-labelledby="who">
        <h1 id="who" className="text-lg font-semibold">{e.name}</h1>
        <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>{SOURCE_LABEL[e.source]} · {new Date(e.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}{e.sourcePage ? ` · ${e.sourcePage}` : ''}</p>
        <p>{e.phone ?? 'No phone'}{e.email ? ` · ${e.email}` : ''}{e.area ? ` · ${e.area}` : ''}</p>
        {e.puppyLabel ? <p>About: <strong>{e.puppyLabel}</strong></p> : null}
        {e.message ? <blockquote className="adm-card whitespace-pre-wrap text-sm">{e.message}</blockquote> : null}
        <div className="flex flex-wrap gap-4">
          {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" className="adm-link">Reply on WhatsApp</a> : null}
          {e.phone ? <a href={`tel:${e.phone}`} className="adm-link">Call</a> : null}
          {e.customerId ? <Link href={adminPaths.customer(e.customerId)} className="adm-link">Customer record</Link> : null}
          {e.customerId ? <Link href={adminPaths.newOrder({ customer: e.customerId, puppy: e.puppyId ?? undefined, enquiry: e.id })} className="adm-link">Create order</Link> : null}
        </div>
      </section>

      <section className="adm-card grid gap-4 sm:grid-cols-2" aria-label="Triage">
        <ActionForm action={enquiryStatusAction.bind(null, e.id)} submitLabel="Update status">
          <SelectField name="status" label="Status" defaultValue={e.status} options={ENQUIRY_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))} />
        </ActionForm>
        <ActionForm action={assignEnquiryAction.bind(null, e.id)} submitLabel="Assign">
          <SelectField name="assignee" label="Assigned to" defaultValue={e.assignedTo ?? ''} options={[{ value: '', label: 'Unassigned' }, ...staff.map((s) => ({ value: s.userId, label: s.fullName }))]} />
        </ActionForm>
      </section>

      <section className="adm-card grid gap-3" aria-labelledby="notes">
        <h2 id="notes" className="font-medium">Notes</h2>
        <ul className="grid gap-2">
          {e.notes.map((n) => (
            <li key={n.id} className="text-sm"><span style={{ color: 'var(--adm-muted)' }}>{n.authorName}, {new Date(n.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span><br />{n.body}</li>
          ))}
          {e.notes.length === 0 ? <li className="text-sm" style={{ color: 'var(--adm-muted)' }}>No notes yet.</li> : null}
        </ul>
        <ActionForm action={addNoteAction.bind(null, e.id)} submitLabel="Add note">
          <div className="grid gap-1">
            <label htmlFor="body" className="text-sm font-medium">New note</label>
            <textarea id="body" name="body" required rows={3} maxLength={4000} className="adm-input" />
          </div>
        </ActionForm>
      </section>
    </main>
  );
}
