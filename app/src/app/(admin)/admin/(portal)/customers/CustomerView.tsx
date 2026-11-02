import Link from 'next/link';
import { formatMoney as moneyOf, ORDER_STATUS_LABEL, type OrderRow } from '@backend/modules/commerce';
import { SOURCE_LABEL, STATUS_LABEL, whatsappLinkFor, type CustomerDetail } from '@backend/modules/inbox';
import { MESSAGE_STATUS_LABEL, type MessageRow, type TemplateGroup } from '@backend/modules/messaging';
import { PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, type PaymentRow } from '@backend/modules/billing';
import { adminPaths } from '@nav';
import { Badge, DataTable, PageHeader } from '@shared/ui/admin';
import { ActionForm, TextField } from '../ActionForm';
import { updateCustomerAction } from '../inbox-actions';
import { ManualMessageForm } from '../ManualMessageForm';
import { ORDER_TONE } from '../orders/orderTone';

export const CUSTOMER_TABS = ['overview', 'orders', 'payments', 'messages', 'privacy'] as const;
export type CustomerTab = (typeof CUSTOMER_TABS)[number];
const TAB_LABEL: Record<CustomerTab, string> = { overview: 'Overview', orders: 'Orders', payments: 'Payments', messages: 'Messages', privacy: 'Privacy' };

export interface TabData { orders?: readonly OrderRow[]; payments?: readonly PaymentRow[]; messages?: readonly MessageRow[] }

/** Customer record: profile header with money chips, then tabs (overview, orders, payments, messages, privacy). */
export function CustomerView({ customer: c, templates, tab, data }: { customer: CustomerDetail; templates: readonly TemplateGroup[]; tab: CustomerTab; data: TabData }) {
  const wa = whatsappLinkFor(c.phone);
  const optIn = c.whatsappOptedOutAt ? 'Opted out of WhatsApp' : c.whatsappOptInAt ? 'WhatsApp updates agreed' : 'No WhatsApp consent';
  return (
    <main className="grid gap-4">
      <PageHeader
        title={c.fullName}
        description={[c.phone, c.email, c.area].filter(Boolean).join(' · ') || 'No contact details'}
        actions={<><Link href={adminPaths.newOrder({ customer: c.id })} className="adm-btn">New order</Link>{wa ? <a href={wa} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-secondary">WhatsApp</a> : null}</>}
      />
      <p className="flex flex-wrap gap-2 text-sm"><Badge tone={c.whatsappOptInAt && !c.whatsappOptedOutAt ? 'success' : 'neutral'}>{optIn}</Badge><Badge tone="info">{c.enquiries.length} enquiries</Badge>{c.tags.map((t) => (<Badge key={t} tone="accent">{t}</Badge>))}</p>
      <nav aria-label="Customer sections" className="flex flex-wrap gap-2">
        {CUSTOMER_TABS.map((t) => (<Link key={t} href={`${adminPaths.customer(c.id)}?tab=${t}`} className={`adm-btn adm-btn-small ${t === tab ? '' : 'adm-btn-secondary'}`} aria-current={t === tab ? 'page' : undefined}>{TAB_LABEL[t]}</Link>))}
      </nav>

      {tab === 'overview' ? (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <section className="adm-card grid gap-3" aria-labelledby="edit">
            <h2 id="edit" className="font-semibold">Details</h2>
            <ActionForm action={updateCustomerAction.bind(null, c.id)} submitLabel="Save">
              <TextField name="fullName" label="Name" defaultValue={c.fullName} />
              <TextField name="email" label="Email" type="email" defaultValue={c.email} required={false} />
              <TextField name="area" label="Area" defaultValue={c.area} required={false} />
              <TextField name="tags" label="Tags" defaultValue={c.tags.join(', ')} required={false} hint="Comma separated, for example repeat, vip." />
              <div className="grid gap-1"><label htmlFor="notes" className="text-sm font-medium">Internal notes</label><textarea id="notes" name="notes" defaultValue={c.notes ?? ''} rows={4} maxLength={4000} className="adm-input" /></div>
            </ActionForm>
          </section>
          <div className="grid gap-4">
            <section className="adm-card grid gap-3" aria-labelledby="send"><h2 id="send" className="font-semibold">Send a message</h2><ManualMessageForm customerId={c.id} orderId={null} templates={templates} /></section>
            <section className="adm-card grid gap-2" aria-labelledby="history">
              <h2 id="history" className="font-semibold">Enquiries</h2>
              <ul className="grid gap-1 text-sm">{c.enquiries.map((e) => (<li key={e.id}><Link href={adminPaths.enquiry(e.id)} className="adm-link">{new Date(e.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</Link> · {STATUS_LABEL[e.status]} · {SOURCE_LABEL[e.source]}{e.puppyLabel ? ` · ${e.puppyLabel}` : ''}</li>))}</ul>
            </section>
          </div>
        </div>
      ) : null}

      {tab === 'orders' ? (
        <DataTable caption="Orders" rows={data.orders ?? []} rowKey={(o) => o.id} empty="No orders yet." columns={[
          { key: 'n', header: 'Order', cell: (o) => <Link href={adminPaths.order(o.id)} className="adm-link font-semibold">{o.number}</Link> },
          { key: 's', header: 'Status', cell: (o) => <Badge tone={ORDER_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge> },
          { key: 'p', header: 'Puppy', cell: (o) => o.puppyLabel ?? '—' },
          { key: 't', header: 'Total', numeric: true, cell: (o) => moneyOf(o.totalMinor, o.currency) },
          { key: 'pd', header: 'Paid', numeric: true, cell: (o) => moneyOf(o.paidMinor, o.currency) },
        ]} />
      ) : null}

      {tab === 'payments' ? (
        <DataTable caption="Payments" rows={data.payments ?? []} rowKey={(p) => p.id} empty="No payments yet." columns={[
          { key: 'd', header: 'Date', cell: (p) => new Date(p.paidAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) },
          { key: 'o', header: 'Order', cell: (p) => p.orderNumber },
          { key: 'm', header: 'Method', cell: (p) => PAYMENT_METHOD_LABEL[p.method] },
          { key: 's', header: 'Status', cell: (p) => PAYMENT_STATUS_LABEL[p.status] },
          { key: 'a', header: 'Amount', numeric: true, cell: (p) => moneyOf(p.amountMinor, p.currency) },
        ]} />
      ) : null}

      {tab === 'messages' ? (
        <DataTable caption="Messages" rows={data.messages ?? []} rowKey={(m) => m.id} empty="No messages yet." columns={[
          { key: 'd', header: 'Sent', cell: (m) => new Date(m.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) },
          { key: 'c', header: 'Channel', cell: (m) => m.channel },
          { key: 's', header: 'Subject', cell: (m) => m.subject ?? m.templateKey ?? '—' },
          { key: 'st', header: 'Status', cell: (m) => MESSAGE_STATUS_LABEL[m.status] ?? m.status },
        ]} />
      ) : null}

      {tab === 'privacy' ? (
        <section className="adm-card grid gap-2" aria-labelledby="priv">
          <h2 id="priv" className="font-semibold">Privacy</h2>
          <p className="text-sm">{optIn}. Export, restriction, consent withdrawal and erasure are in the privacy tools.</p>
          <Link href={adminPaths.privacySubject(c.id)} className="adm-btn justify-self-start">Open privacy tools</Link>
        </section>
      ) : null}
    </main>
  );
}
