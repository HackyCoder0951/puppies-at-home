import { notFound } from 'next/navigation';
import { inboxMessage } from '@backend/modules/inbox';
import { getInbox, getMessaging } from '@composition';
import { CustomerView } from '../CustomerView';

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const [result, templates] = await Promise.all([params.then(async ({ id }) => (await getInbox()).getCustomer(id)), getMessaging().then((m) => m.templates())]);
  if (!result.ok) {
    if (result.error.code === 'not-found') notFound();
    return <p role="alert" className="adm-error">{inboxMessage(result.error)}</p>;
  }
  return <CustomerView customer={result.value} templates={templates.ok ? templates.value : []} />;
}
