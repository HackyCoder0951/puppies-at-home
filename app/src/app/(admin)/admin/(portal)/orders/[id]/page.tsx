import { notFound } from 'next/navigation';
import { commerceMessage } from '@backend/modules/commerce';
import { getCommerce } from '@composition';
import { OrderView } from '../OrderView';

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const result = await (await getCommerce()).getOrder((await params).id);
  if (!result.ok) {
    if (result.error.code === 'not-found') notFound();
    return <p role="alert" className="adm-error">{commerceMessage(result.error)}</p>;
  }
  return <OrderView order={result.value} />;
}
