/** Public API of the commerce module. `createStaffCommerce` wires the Supabase adapter for one signed-in request. */
import { createSessionClient } from '@platform';
import { createCommerce, type Commerce } from './application';
import { SupabaseCommerceRepository } from './infrastructure';

export { moduleDefinition } from './module.config';
export type { Commerce, CommerceError } from './application';
export type { OrderRow, OrderDetail, DeliveryRow, DeliveryEventRow, OrderStatus, DeliveryStatus, DeliveryMethod, OrderType, SellablePuppy, CustomerOption, OrderItemRow, OrderEventRow } from './domain';
export { ORDER_STATUSES, DELIVERY_STATUSES, DELIVERY_METHODS, PAGE_SIZE, nextOrderStatuses, nextDeliveryStatuses, canEditItems, formatMoney } from './domain';
export { commerceMessage, ORDER_STATUS_LABEL, DELIVERY_STATUS_LABEL, DELIVERY_METHOD_LABEL } from './presentation';

export async function createStaffCommerce(): Promise<Commerce> {
  return createCommerce(new SupabaseCommerceRepository(await createSessionClient()));
}
