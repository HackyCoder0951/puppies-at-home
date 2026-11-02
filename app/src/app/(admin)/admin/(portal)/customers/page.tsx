import { inboxMessage } from '@backend/modules/inbox';
import { getInbox } from '@composition';
import { CustomerList } from './CustomerList';

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const result = await (await getInbox()).listCustomers(sp.q, page);
  if (!result.ok) return <p role="alert" className="adm-error">{inboxMessage(result.error)}</p>;
  return <CustomerList rows={result.value.rows} total={result.value.total} page={page} q={sp.q} />;
}
