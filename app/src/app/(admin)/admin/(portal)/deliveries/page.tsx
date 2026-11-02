import { commerceMessage } from '@backend/modules/commerce';
import { getCommerce } from '@composition';
import { currentTime } from '../privacy/now';
import { DeliveryList } from './DeliveryList';

export default async function DeliveriesPage() {
  const result = await (await getCommerce()).listOpenDeliveries();
  if (!result.ok) return <p role="alert" className="adm-error">{commerceMessage(result.error)}</p>;
  return <DeliveryList rows={result.value} now={currentTime()} />;
}
