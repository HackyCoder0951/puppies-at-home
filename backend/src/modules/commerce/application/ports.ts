import type { CustomerOption, DeliveryRow, DeliveryStatus, OrderDetail, OrderQuery, OrderRow, OrderStatus, SellablePuppy } from '../domain';
import type { DeliveryInput, ItemsInput, OrderInput } from './schemas';

/** `rule` carries a message raised by one of our own database functions (safe to show); the rest are mapped codes. */
export class RepositoryError extends Error {
  constructor(readonly kind: 'forbidden' | 'not-found' | 'invalid' | 'rule' | 'conflict' | 'unavailable', message: string) {
    super(message);
  }
}

export interface CommerceRepository {
  listOrders(query: OrderQuery): Promise<{ rows: readonly OrderRow[]; total: number }>;
  getOrder(id: string): Promise<OrderDetail | null>;
  createOrder(input: OrderInput): Promise<{ id: string; number: string }>;
  setItems(orderId: string, input: ItemsInput): Promise<void>;
  updateOrder(orderId: string, notes: string | null, assignedTo: string | null): Promise<void>;
  transitionOrder(orderId: string, to: OrderStatus, reason: string | null): Promise<void>;
  createDelivery(orderId: string, input: DeliveryInput): Promise<string>;
  updateDelivery(deliveryId: string, input: DeliveryInput): Promise<void>;
  transitionDelivery(deliveryId: string, to: DeliveryStatus, note: string | null, location: string | null): Promise<void>;
  listOpenDeliveries(): Promise<readonly DeliveryRow[]>;
  listSellablePuppies(): Promise<readonly SellablePuppy[]>;
  getCustomerOption(id: string): Promise<CustomerOption | null>;
}
