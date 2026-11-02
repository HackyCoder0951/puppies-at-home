import type { CommerceError } from '../application';
import type { DeliveryMethod, DeliveryStatus, OrderStatus } from '../domain';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'New', confirmed: 'Confirmed', deposit_paid: 'Deposit paid', preparing: 'Preparing', in_transit: 'In transit', delivered: 'Delivered', completed: 'Completed', cancelled: 'Cancelled',
};
export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  scheduled: 'Scheduled', packed: 'Packed', dispatched: 'Dispatched', in_transit: 'In transit', arrived: 'Arrived', delivered: 'Delivered', delayed: 'Delayed', failed: 'Failed',
};
export const DELIVERY_METHOD_LABEL: Record<DeliveryMethod, string> = { showroom_pickup: 'Showroom pickup', dubai_delivery: 'Dubai delivery', international_cargo: 'International cargo' };

const FIELD: Record<string, string> = { description: 'Item description', quantity: 'Quantity (1 to 99)', unitMinor: 'Item price', items: 'Items', deposit: 'Deposit (it cannot exceed the total)', customerId: 'Customer', eta: 'Expected date', status: 'Status', method: 'Method' };

export function commerceMessage(error: CommerceError): string {
  switch (error.code) {
    case 'invalid':
      return error.field && FIELD[error.field] ? `Check this field: ${FIELD[error.field]}.` : 'Some fields are not valid.';
    case 'rule':
      return error.message;
    case 'forbidden':
      return 'Your role is not allowed to do that.';
    case 'not-found':
      return 'That record no longer exists.';
    case 'conflict':
      return 'That puppy already has an open order.';
    case 'unavailable':
      return 'Could not complete that right now. Try again shortly.';
  }
}
