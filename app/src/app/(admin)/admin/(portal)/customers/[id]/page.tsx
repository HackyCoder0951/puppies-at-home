import { notFound } from 'next/navigation';
import { inboxMessage } from '@backend/modules/inbox';
import { getInbox } from '@composition';
import { CustomerView } from '../CustomerView';

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const result = await (await getInbox()).getCustomer((await params).id);
  if (!result.ok) {
    if (result.error.code === 'not-found') notFound();
    return <p role="alert" className="adm-error">{inboxMessage(result.error)}</p>;
  }
  return <CustomerView customer={result.value} />;
}
