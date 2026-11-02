import { commerceMessage, ORDER_STATUSES, type OrderStatus } from '@backend/modules/commerce';
import { getCommerce } from '@composition';
import { OrderList } from './OrderList';

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string; view?: string }> }) {
  const sp = await searchParams;
  const view = sp.view === 'table' ? 'table' : 'board';
  const status = ORDER_STATUSES.find((s) => s === sp.status) as OrderStatus | undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const commerce = await getCommerce();
  const result = await (view === 'board' ? commerce.listOrders({ page: 1, pageSize: 200, open: true }) : commerce.listOrders({ status, search: sp.q, page }));
  if (!result.ok) return <p role="alert" className="adm-error">{commerceMessage(result.error)}</p>;
  return <OrderList rows={result.value.rows} total={result.value.total} page={page} status={status} q={sp.q} view={view} />;
}
