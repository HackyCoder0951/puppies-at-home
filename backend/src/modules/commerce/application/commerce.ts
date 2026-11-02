import { err, ok, type Result } from '@backend/kernel';
import { DELIVERY_STATUSES, type CustomerOption, type DeliveryRow, type OrderDetail, type OrderQuery, type OrderRow, type SellablePuppy } from '../domain';
import { RepositoryError, type CommerceRepository } from './ports';
import { deliveryInputSchema, itemsInputSchema, orderInputSchema, orderStatusSchema } from './schemas';

export type CommerceError =
  | { code: 'invalid'; field?: string }
  | { code: 'rule'; message: string }
  | { code: 'forbidden' }
  | { code: 'not-found' }
  | { code: 'conflict' }
  | { code: 'unavailable' };

const fieldOf = (issue: { path: PropertyKey[]; message: string } | undefined) => String(issue?.path.at(-1) ?? issue?.message ?? '');

export function createCommerce(repo: CommerceRepository) {
  async function run<T>(action: () => Promise<T>): Promise<Result<T, CommerceError>> {
    try {
      return ok(await action());
    } catch (error) {
      if (error instanceof RepositoryError) return err(error.kind === 'rule' ? { code: 'rule', message: error.message } : { code: error.kind });
      throw error;
    }
  }
  const found = <T>(r: Result<T | null, CommerceError>): Result<T, CommerceError> => (!r.ok ? r : r.value ? ok(r.value) : err({ code: 'not-found' }));

  return {
    listOrders: (query: OrderQuery): Promise<Result<{ rows: readonly OrderRow[]; total: number }, CommerceError>> => run(() => repo.listOrders({ ...query, page: Math.max(1, query.page) })),
    getOrder: async (id: string): Promise<Result<OrderDetail, CommerceError>> => found(await run(() => repo.getOrder(id))),
    listOpenDeliveries: (): Promise<Result<readonly DeliveryRow[], CommerceError>> => run(() => repo.listOpenDeliveries()),
    listSellablePuppies: (): Promise<Result<readonly SellablePuppy[], CommerceError>> => run(() => repo.listSellablePuppies()),
    getCustomerOption: async (id: string): Promise<Result<CustomerOption, CommerceError>> => found(await run(() => repo.getCustomerOption(id))),

    async createOrder(raw: unknown): Promise<Result<{ id: string; number: string }, CommerceError>> {
      const parsed = orderInputSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: fieldOf(parsed.error.issues[0]) });
      const total = parsed.data.items.reduce((sum, i) => sum + i.quantity * i.unitMinor, 0);
      if (parsed.data.depositMinor > total) return err({ code: 'invalid', field: 'deposit' });
      return run(() => repo.createOrder(parsed.data));
    },

    async setItems(orderId: string, raw: unknown): Promise<Result<true, CommerceError>> {
      const parsed = itemsInputSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: fieldOf(parsed.error.issues[0]) });
      return run(async () => (await repo.setItems(orderId, parsed.data), true as const));
    },

    updateOrder: (orderId: string, notes: string, assignedTo: string | null) =>
      run(async () => (await repo.updateOrder(orderId, notes.trim().slice(0, 2000) || null, assignedTo), true as const)),

    async transitionOrder(orderId: string, rawTo: unknown, reason: string): Promise<Result<true, CommerceError>> {
      const to = orderStatusSchema.safeParse(rawTo);
      if (!to.success) return err({ code: 'invalid', field: 'status' });
      return run(async () => (await repo.transitionOrder(orderId, to.data, reason.trim() || null), true as const));
    },

    async createDelivery(orderId: string, raw: unknown): Promise<Result<string, CommerceError>> {
      const parsed = deliveryInputSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: fieldOf(parsed.error.issues[0]) });
      return run(() => repo.createDelivery(orderId, parsed.data));
    },

    async updateDelivery(deliveryId: string, raw: unknown): Promise<Result<true, CommerceError>> {
      const parsed = deliveryInputSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: fieldOf(parsed.error.issues[0]) });
      return run(async () => (await repo.updateDelivery(deliveryId, parsed.data), true as const));
    },

    async transitionDelivery(deliveryId: string, rawTo: unknown, note: string, location: string): Promise<Result<true, CommerceError>> {
      const to = (DELIVERY_STATUSES as readonly string[]).includes(String(rawTo)) ? (rawTo as (typeof DELIVERY_STATUSES)[number]) : null;
      if (!to) return err({ code: 'invalid', field: 'status' });
      return run(async () => (await repo.transitionDelivery(deliveryId, to, note.trim().slice(0, 500) || null, location.trim().slice(0, 120) || null), true as const));
    },
  };
}

export type Commerce = ReturnType<typeof createCommerce>;
