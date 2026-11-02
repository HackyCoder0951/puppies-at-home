import Link from 'next/link';
import { SOURCE_LABEL, STATUS_LABEL, whatsappLinkFor, type CustomerDetail } from '@backend/modules/inbox';
import { adminPaths } from '@nav';
import { ActionForm, TextField } from '../ActionForm';
import { updateCustomerAction } from '../inbox-actions';

export function CustomerView({ customer: c }: { customer: CustomerDetail }) {
  const wa = whatsappLinkFor(c.phone);
  const optIn = c.whatsappOptedOutAt ? 'Opted out of WhatsApp updates' : c.whatsappOptInAt ? 'Agreed to WhatsApp updates' : 'No WhatsApp update consent';
  return (
    <main className="grid gap-6">
      <section className="adm-card grid gap-2" aria-labelledby="customer">
        <h1 id="customer" className="text-lg font-semibold">{c.fullName}</h1>
        <p>{[c.phone, c.email].filter(Boolean).join(' · ') || 'No contact details'}</p>
        <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>{optIn}</p>
        {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" className="adm-link">Open WhatsApp chat</a> : null}
        <Link href={adminPaths.newOrder({ customer: c.id })} className="adm-link">New order</Link>
      </section>
      <section className="adm-card grid gap-4" aria-labelledby="edit">
        <h2 id="edit" className="font-medium">Details</h2>
        <ActionForm action={updateCustomerAction.bind(null, c.id)} submitLabel="Save">
          <TextField name="fullName" label="Name" defaultValue={c.fullName} />
          <TextField name="email" label="Email" type="email" defaultValue={c.email} required={false} />
          <TextField name="area" label="Area" defaultValue={c.area} required={false} />
          <TextField name="tags" label="Tags" defaultValue={c.tags.join(', ')} required={false} hint="Comma separated, for example repeat, vip." />
          <div className="grid gap-1">
            <label htmlFor="notes" className="text-sm font-medium">Internal notes</label>
            <textarea id="notes" name="notes" defaultValue={c.notes ?? ''} rows={4} maxLength={4000} className="adm-input" />
          </div>
        </ActionForm>
      </section>
      <section className="adm-card grid gap-2" aria-labelledby="history">
        <h2 id="history" className="font-medium">Enquiries</h2>
        <ul className="grid gap-2">
          {c.enquiries.map((e) => (
            <li key={e.id} className="text-sm">
              <Link href={adminPaths.enquiry(e.id)} className="adm-link">{new Date(e.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</Link>
              {' · '}{STATUS_LABEL[e.status]} · {SOURCE_LABEL[e.source]}{e.puppyLabel ? ` · ${e.puppyLabel}` : ''}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
