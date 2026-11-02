import { notFound } from 'next/navigation';
import { commerceMessage } from '@backend/modules/commerce';
import { getBilling, getCommerce } from '@composition';
import { OrderView } from '../OrderView';
import { MoneySection } from '../MoneySection';

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [result, money] = await Promise.all([(await getCommerce()).getOrder(id), (await getBilling()).orderMoney(id)]);
  if (!result.ok) {
    if (result.error.code === 'not-found') notFound();
    return <p role="alert" className="adm-error">{commerceMessage(result.error)}</p>;
  }
  return <OrderView order={result.value}>{money.ok ? <MoneySection order={result.value} money={money.value} /> : null}</OrderView>;
}
