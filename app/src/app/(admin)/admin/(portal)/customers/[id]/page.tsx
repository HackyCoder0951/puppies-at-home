import { notFound } from 'next/navigation';
import { inboxMessage } from '@backend/modules/inbox';
import { getBilling, getCommerce, getInbox, getMessaging } from '@composition';
import { CUSTOMER_TABS, CustomerView, type CustomerTab, type TabData } from '../CustomerView';

export default async function CustomerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const requested = (await searchParams).tab;
  const tab = (CUSTOMER_TABS.find((t) => t === requested) ?? 'overview') as CustomerTab;
  const [result, templates] = await Promise.all([getInbox().then((i) => i.getCustomer(id)), getMessaging().then((m) => m.templates())]);
  if (!result.ok) {
    if (result.error.code === 'not-found') notFound();
    return <p role="alert" className="adm-error">{inboxMessage(result.error)}</p>;
  }
  const data: TabData = {};
  if (tab === 'orders') { const r = await (await getCommerce()).listOrders({ customerId: id, page: 1, pageSize: 100 }); if (r.ok) data.orders = r.value.rows; }
  if (tab === 'payments') { const r = await (await getBilling()).listPayments(1, id); if (r.ok) data.payments = r.value.rows; }
  if (tab === 'messages') { const r = await (await getMessaging()).messages(undefined, 1, id); if (r.ok) data.messages = r.value.rows; }
  return <CustomerView customer={result.value} templates={templates.ok ? templates.value : []} tab={tab} data={data} />;
}
