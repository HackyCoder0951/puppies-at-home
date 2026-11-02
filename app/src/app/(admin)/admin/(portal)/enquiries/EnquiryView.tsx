import Link from 'next/link';
import { ENQUIRY_STATUSES, SOURCE_LABEL, STATUS_LABEL, whatsappLinkFor, type EnquiryDetail, type StaffOption } from '@backend/modules/inbox';
import type { TemplateGroup } from '@backend/modules/messaging';
import { adminPaths } from '@nav';
import { Badge, PageHeader } from '@shared/ui/admin';
import { ActionForm, SelectField } from '../ActionForm';
import { addNoteAction, assignEnquiryAction, enquiryStatusAction } from '../inbox-actions';
import { ManualMessageForm } from '../ManualMessageForm';
import { ENQUIRY_TONE } from './enquiryTone';

/** Split view: the conversation on the left, the customer, triage and quick actions on the right. */
export function EnquiryView({ enquiry: e, staff, templates }: { enquiry: EnquiryDetail; staff: readonly StaffOption[]; templates: readonly TemplateGroup[] }) {
  const wa = whatsappLinkFor(e.phone, `Hi ${e.name}, this is TeddyPups U.A.E. replying to your enquiry.`);
  const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  return (
    <main className="grid gap-4">
      <PageHeader
        title={e.name}
        description={<><Badge tone={ENQUIRY_TONE[e.status]}>{STATUS_LABEL[e.status]}</Badge> {SOURCE_LABEL[e.source]} · {when(e.createdAt)}{e.sourcePage ? ` · ${e.sourcePage}` : ''}</>}
        actions={e.customerId ? <Link href={adminPaths.newOrder({ customer: e.customerId, puppy: e.puppyId ?? undefined, enquiry: e.id })} className="adm-btn">Create order</Link> : undefined}
      />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="grid gap-4" aria-label="Conversation">
          <div className="adm-card grid gap-2">
            <h2 className="font-semibold">Message</h2>
            {e.puppyLabel ? <p className="text-sm">About <strong>{e.puppyLabel}</strong></p> : null}
            <blockquote className="whitespace-pre-wrap">{e.message ?? 'No message.'}</blockquote>
          </div>
          <div className="adm-card grid gap-3" aria-labelledby="notes">
            <h2 id="notes" className="font-semibold">Notes</h2>
            <ol className="grid gap-3">
              {e.notes.map((n) => (<li key={n.id} className="text-sm"><span className="adm-muted">{n.authorName}, {when(n.createdAt)}</span><br />{n.body}</li>))}
              {e.notes.length === 0 ? <li className="adm-muted text-sm">No notes yet.</li> : null}
            </ol>
            <ActionForm action={addNoteAction.bind(null, e.id)} submitLabel="Add note">
              <div className="grid gap-1"><label htmlFor="body" className="text-sm font-medium">New note</label><textarea id="body" name="body" required rows={3} maxLength={4000} className="adm-input" /></div>
            </ActionForm>
          </div>
        </section>
        <aside className="grid gap-4" aria-label="Customer and actions">
          <div className="adm-card grid gap-1">
            <h2 className="font-semibold">Customer</h2>
            <p>{e.phone ?? 'No phone'}</p>
            {e.email ? <p className="break-all">{e.email}</p> : null}
            {e.area ? <p className="adm-muted text-sm">{e.area}</p> : null}
            <div className="mt-1 flex flex-wrap gap-3">
              {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" className="adm-link">Reply on WhatsApp</a> : null}
              {e.phone ? <a href={`tel:${e.phone}`} className="adm-link">Call</a> : null}
              {e.customerId ? <Link href={adminPaths.customer(e.customerId)} className="adm-link">Customer record</Link> : null}
            </div>
          </div>
          <div className="adm-card grid gap-3" aria-label="Triage">
            <ActionForm action={enquiryStatusAction.bind(null, e.id)} submitLabel="Update status"><SelectField name="status" label="Status" defaultValue={e.status} options={ENQUIRY_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))} /></ActionForm>
            <ActionForm action={assignEnquiryAction.bind(null, e.id)} submitLabel="Assign"><SelectField name="assignee" label="Owner" defaultValue={e.assignedTo ?? ''} options={[{ value: '', label: 'Unassigned' }, ...staff.map((s) => ({ value: s.userId, label: s.fullName }))]} /></ActionForm>
          </div>
          {e.customerId ? (
            <div className="adm-card grid gap-2"><h2 className="font-semibold">Quick reply</h2><ManualMessageForm customerId={e.customerId} orderId={null} templates={templates} /></div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
