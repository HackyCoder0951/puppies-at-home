import type { DeliveryStatus, OrderStatus, OrderType } from './types';

/**
 * Moves the UI offers. The database is the authority (triggers reject anything else); this only decides which buttons
 * to show, so it mirrors `app_private.order_transition_ok` and `delivery_transition_ok`.
 */
export function nextOrderStatuses(from: OrderStatus, type: OrderType): readonly OrderStatus[] {
  switch (from) {
    case 'new': return ['confirmed', 'cancelled'];
    case 'confirmed': return ['deposit_paid', 'cancelled'];
    case 'deposit_paid': return type === 'local' ? ['preparing', 'delivered', 'cancelled'] : ['preparing', 'cancelled'];
    case 'preparing': return type === 'local' ? ['in_transit', 'delivered', 'cancelled'] : ['in_transit', 'cancelled'];
    case 'in_transit': return ['delivered'];
    case 'delivered': return ['completed'];
    default: return [];
  }
}

export function nextDeliveryStatuses(from: DeliveryStatus): readonly DeliveryStatus[] {
  switch (from) {
    case 'scheduled': return ['packed', 'delayed', 'failed'];
    case 'packed': return ['dispatched', 'delayed', 'failed'];
    case 'dispatched': return ['in_transit', 'delayed', 'failed'];
    case 'in_transit': return ['arrived', 'delayed', 'failed'];
    case 'arrived': return ['delivered', 'delayed', 'failed'];
    case 'delayed': return ['packed', 'dispatched', 'in_transit', 'arrived', 'failed'];
    default: return [];
  }
}

export const canEditItems = (status: OrderStatus): boolean => status === 'new' || status === 'confirmed';
