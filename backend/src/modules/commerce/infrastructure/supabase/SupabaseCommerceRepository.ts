import type { SupabaseClient } from '@supabase/supabase-js';
import {
  PAGE_SIZE, type CustomerOption, type DeliveryRow, type DeliveryStatus, type OrderDetail, type OrderQuery, type OrderRow, type OrderStatus, type SellablePuppy,
  type DeliveryEventRow, type OrderType,
} from '../../domain';
import { RepositoryError, type CommerceRepository, type DeliveryInput, type ItemsInput, type OrderInput } from '../../application';

type Failure = { code?: string; message: string } | null;

function fail(error: Failure): never {
  const message = error?.message ?? 'unknown';
  switch (error?.code) {
    case '42501': throw new RepositoryError('forbidden', message);
    case '23505': throw new RepositoryError('conflict', message);
    case 'P0001': case '22023': throw new RepositoryError('rule', message);   // raised by our own functions: written for staff
    default: throw new RepositoryError('unavailable', message);
  }
}

const puppyLabel = (p: { name: string | null; breed: string } | null) => (p ? (p.name ? `${p.name} (${p.breed})` : p.breed) : null);
const SEX = { male: 'boy', female: 'girl', 'male-female': 'boy & girl' } as const;

interface OrderDb {
  id: string; number: string; customer_id: string; type: OrderType; status: OrderStatus; total_minor: number; paid_minor: number; currency: string; created_at: string;
  customers: { full_name: string } | null; puppies: { name: string | null; breed: string } | null;
}
interface DeliveryDb {
  id: string; order_id: string; method: DeliveryRow['method']; carrier: string | null; tracking_no: string | null; address: { text?: string } | null; eta: string | null; status: DeliveryStatus; delivered_at: string | null;
  delivery_events?: { id: number; status: DeliveryStatus; note: string | null; location: string | null; occurred_at: string }[];
  orders?: { number: string; customers: { full_name: string } | null } | null;
}

const ORDER_LIST = 'id, number, customer_id, type, status, total_minor, paid_minor, currency, created_at, customers(full_name), puppies(name, breed)';
const toRow = (o: OrderDb): OrderRow => ({
  id: o.id, number: o.number, customerId: o.customer_id, customerName: o.customers?.full_name ?? 'Unknown', puppyLabel: puppyLabel(o.puppies), type: o.type, status: o.status,
  totalMinor: Number(o.total_minor), paidMinor: Number(o.paid_minor), currency: o.currency, createdAt: o.created_at,
});
const toDelivery = (d: DeliveryDb): DeliveryRow => ({
  id: d.id, orderId: d.order_id, orderNumber: d.orders?.number, customerName: d.orders?.customers?.full_name, method: d.method, carrier: d.carrier, trackingNo: d.tracking_no,
  addressText: d.address?.text ?? null, eta: d.eta, status: d.status, deliveredAt: d.delivered_at,
  events: [...(d.delivery_events ?? [])].sort((a, b) => a.id - b.id).map((e): DeliveryEventRow => ({ id: e.id, status: e.status, note: e.note, location: e.location, occurredAt: e.occurred_at })),
});

export class SupabaseCommerceRepository implements CommerceRepository {
  constructor(private readonly client: SupabaseClient) {}

  private async rpc<T = null>(name: string, args: Record<string, unknown>): Promise<T> {
    const { data, error } = await this.client.rpc(name, args);
    if (error) fail(error);
    return data as T;
  }

  async listOrders(q: OrderQuery) {
    let query = this.client.from('orders').select(ORDER_LIST, { count: 'exact' });
    if (q.status) query = query.eq('status', q.status);
    if (q.open) query = query.not('status', 'in', '(completed,cancelled)');
    if (q.customerId) query = query.eq('customer_id', q.customerId);
    const size = Math.min(q.pageSize ?? PAGE_SIZE, 200);
    const search = (q.search ?? '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 20);
    if (search) query = query.ilike('number', `%${search}%`);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range((q.page - 1) * size, q.page * size - 1);
    if (error) fail(error);
    return { rows: (data as unknown as OrderDb[]).map(toRow), total: count ?? 0 };
  }

  async getOrder(id: string): Promise<OrderDetail | null> {
    const { data, error } = await this.client
      .from('orders')
      .select(`${ORDER_LIST}, deposit_minor, balance_minor, notes, cancel_reason, assigned_to, puppy_id, enquiry_id,
        order_items(description, quantity, unit_minor, sort_order), order_events(id, from_status, to_status, reason, actor_id, created_at),
        deliveries(id, order_id, method, carrier, tracking_no, address, eta, status, delivered_at, delivery_events(id, status, note, location, occurred_at))`)
      .eq('id', id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const o = data as unknown as OrderDb & {
      deposit_minor: number; balance_minor: number; notes: string | null; cancel_reason: string | null; assigned_to: string | null; puppy_id: string | null; enquiry_id: string | null;
      order_items: { description: string; quantity: number; unit_minor: number; sort_order: number }[];
      order_events: { id: number; from_status: OrderStatus | null; to_status: OrderStatus; reason: string | null; actor_id: string | null; created_at: string }[];
      deliveries: DeliveryDb[];
    };
    const staff = new Map(((await this.rpc<{ user_id: string; full_name: string }[]>('list_staff', {})) ?? []).map((s) => [s.user_id, s.full_name]));
    return {
      ...toRow(o), depositMinor: Number(o.deposit_minor), balanceMinor: Number(o.balance_minor), notes: o.notes, cancelReason: o.cancel_reason, assignedTo: o.assigned_to, puppyId: o.puppy_id, enquiryId: o.enquiry_id,
      items: [...o.order_items].sort((a, b) => a.sort_order - b.sort_order).map((i) => ({ description: i.description, quantity: i.quantity, unitMinor: Number(i.unit_minor) })),
      events: [...o.order_events].sort((a, b) => a.id - b.id).map((e) => ({ id: e.id, from: e.from_status, to: e.to_status, reason: e.reason, actorName: e.actor_id ? (staff.get(e.actor_id) ?? 'Former staff member') : 'System', createdAt: e.created_at })),
      deliveries: o.deliveries.map(toDelivery),
    };
  }

  private itemsJson = (items: ItemsInput['items']) => items.map((i) => ({ description: i.description, quantity: i.quantity, unitMinor: i.unitMinor }));

  async createOrder(input: OrderInput) {
    const result = await this.rpc<{ id: string; number: string }>('create_order', {
      p_customer: input.customerId, p_puppy: input.puppyId, p_type: input.type, p_items: this.itemsJson(input.items), p_deposit_minor: input.depositMinor, p_notes: input.notes, p_enquiry: input.enquiryId,
    });
    return { id: result.id, number: result.number };
  }

  async setItems(orderId: string, input: ItemsInput) {
    await this.rpc('set_order_items', { p_order: orderId, p_items: this.itemsJson(input.items), p_deposit_minor: input.depositMinor });
  }

  async updateOrder(orderId: string, notes: string | null, assignedTo: string | null) {
    await this.rpc('update_order', { p_order: orderId, p_notes: notes, p_assigned_to: assignedTo });
  }

  async transitionOrder(orderId: string, to: OrderStatus, reason: string | null) {
    await this.rpc('transition_order', { p_order: orderId, p_to: to, p_reason: reason });
  }

  async createDelivery(orderId: string, input: DeliveryInput) {
    return this.rpc<string>('create_delivery', {
      p_order: orderId, p_method: input.method, p_carrier: input.carrier, p_tracking: input.trackingNo, p_address: input.addressText ? { text: input.addressText } : null, p_eta: input.eta,
    });
  }

  async updateDelivery(deliveryId: string, input: DeliveryInput) {
    await this.rpc('update_delivery', { p_delivery: deliveryId, p_carrier: input.carrier, p_tracking: input.trackingNo, p_address: input.addressText ? { text: input.addressText } : null, p_eta: input.eta });
  }

  async transitionDelivery(deliveryId: string, to: DeliveryStatus, note: string | null, location: string | null) {
    await this.rpc('transition_delivery', { p_delivery: deliveryId, p_to: to, p_note: note, p_location: location });
  }

  async listOpenDeliveries() {
    const { data, error } = await this.client
      .from('deliveries')
      .select('id, order_id, method, carrier, tracking_no, address, eta, status, delivered_at, orders(number, customers(full_name))')
      .not('status', 'in', '(delivered,failed)')
      .order('eta', { ascending: true, nullsFirst: false })
      .limit(100);
    if (error) fail(error);
    return (data as unknown as DeliveryDb[]).map(toDelivery);
  }

  async listSellablePuppies(): Promise<SellablePuppy[]> {
    const { data, error } = await this.client.from('puppies').select('id, name, breed, sex, origin, price_minor').eq('status', 'available').is('deleted_at', null).order('sort_order');
    if (error) fail(error);
    return (data as { id: string; name: string | null; breed: string; sex: keyof typeof SEX; origin: OrderType; price_minor: number | null }[]).map((p) => ({
      id: p.id, label: `${p.name ? `${p.name}, ` : ''}${p.breed} (${SEX[p.sex]})`, priceMinor: p.price_minor === null ? null : Number(p.price_minor), origin: p.origin,
    }));
  }

  async getCustomerOption(id: string): Promise<CustomerOption | null> {
    const { data, error } = await this.client.from('customers').select('id, full_name, phone_e164').eq('id', id).is('deleted_at', null).maybeSingle();
    if (error) fail(error);
    return data ? { id: data.id, fullName: data.full_name, phone: data.phone_e164 } : null;
  }
}
