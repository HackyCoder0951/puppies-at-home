import { commerceMessage, ORDER_STATUSES, type OrderStatus } from '@backend/modules/commerce';
import { getCommerce } from '@composition';
import { OrderList } from './OrderList';

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const sp = await searchParams;
  const status = ORDER_STATUSES.find((s) => s === sp.status) as OrderStatus | undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const result = await (await getCommerce()).listOrders({ status, search: sp.q, page });
  if (!result.ok) return <p role="alert" className="adm-error">{commerceMessage(result.error)}</p>;
  return <OrderList rows={result.value.rows} total={result.value.total} page={page} status={status} q={sp.q} />;
}
