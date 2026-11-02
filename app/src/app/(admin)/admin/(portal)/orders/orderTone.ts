import type { Tone } from '@shared/ui/admin';
import type { OrderStatus } from '@backend/modules/commerce';

export const ORDER_TONE: Record<OrderStatus, Tone> = { new: 'info', confirmed: 'info', deposit_paid: 'accent', preparing: 'warning', in_transit: 'warning', delivered: 'success', completed: 'success', cancelled: 'danger' };
