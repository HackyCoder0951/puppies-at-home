export const ORDER_STATUSES = ['new', 'confirmed', 'deposit_paid', 'preparing', 'in_transit', 'delivered', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OrderType = 'local' | 'imported';
export const DELIVERY_METHODS = ['showroom_pickup', 'dubai_delivery', 'international_cargo'] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];
export const DELIVERY_STATUSES = ['scheduled', 'packed', 'dispatched', 'in_transit', 'arrived', 'delivered', 'delayed', 'failed'] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export interface OrderRow {
  readonly id: string;
  readonly number: string;
  readonly customerId: string;
  readonly customerName: string;
  readonly puppyLabel: string | null;
  readonly type: OrderType;
  readonly status: OrderStatus;
  readonly totalMinor: number;
  readonly paidMinor: number;
  readonly currency: string;
  readonly createdAt: string;
}

export interface OrderItemRow { readonly description: string; readonly quantity: number; readonly unitMinor: number }
export interface OrderEventRow { readonly id: number; readonly from: OrderStatus | null; readonly to: OrderStatus; readonly reason: string | null; readonly actorName: string; readonly createdAt: string }
export interface DeliveryEventRow { readonly id: number; readonly status: DeliveryStatus; readonly note: string | null; readonly location: string | null; readonly occurredAt: string }

export interface DeliveryRow {
  readonly id: string;
  readonly orderId: string;
  readonly orderNumber?: string;
  readonly customerName?: string;
  readonly method: DeliveryMethod;
  readonly carrier: string | null;
  readonly trackingNo: string | null;
  readonly addressText: string | null;
  readonly eta: string | null;
  readonly status: DeliveryStatus;
  readonly deliveredAt: string | null;
  readonly events: readonly DeliveryEventRow[];
}

export interface OrderDetail extends OrderRow {
  readonly depositMinor: number;
  readonly balanceMinor: number;
  readonly notes: string | null;
  readonly cancelReason: string | null;
  readonly assignedTo: string | null;
  readonly puppyId: string | null;
  readonly enquiryId: string | null;
  readonly items: readonly OrderItemRow[];
  readonly events: readonly OrderEventRow[];
  readonly deliveries: readonly DeliveryRow[];
}

export interface SellablePuppy { readonly id: string; readonly label: string; readonly priceMinor: number | null; readonly origin: OrderType }
export interface CustomerOption { readonly id: string; readonly fullName: string; readonly phone: string | null }

export interface OrderQuery { readonly status?: OrderStatus; readonly search?: string; readonly page: number; /** Board view: more rows per page and only orders that are not completed or cancelled. */ readonly pageSize?: number; readonly open?: boolean }
export const PAGE_SIZE = 25;
