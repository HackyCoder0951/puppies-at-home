import { err, ok, type Result } from '@backend/kernel';
import type { InvoiceDetail, InvoiceQuery, InvoiceRow, OrderMoney, PaymentRow, TaxRate } from '../domain';
import { RepositoryError, type BillingRepository } from './ports';
import { dueDateSchema, paymentInputSchema, refundRequestSchema, taxRateSchema } from './schemas';

export type BillingError =
  | { code: 'invalid'; field?: string }
  | { code: 'rule'; message: string }
  | { code: 'forbidden' }
  | { code: 'not-found' }
  | { code: 'unavailable' };

const fieldOf = (issue: { path: PropertyKey[]; message: string } | undefined) => String(issue?.path.at(-1) ?? issue?.message ?? '');

export function createBilling(repo: BillingRepository) {
  async function run<T>(action: () => Promise<T>): Promise<Result<T, BillingError>> {
    try {
      return ok(await action());
    } catch (error) {
      if (error instanceof RepositoryError) return err(error.kind === 'rule' ? { code: 'rule', message: error.message } : error.kind === 'invalid' ? { code: 'invalid' } : { code: error.kind });
      throw error;
    }
  }
  const dueOf = (raw: string): Result<string | null, BillingError> => {
    const parsed = dueDateSchema.safeParse(raw);
    return parsed.success ? ok(parsed.data) : err({ code: 'invalid', field: 'dueAt' });
  };

  return {
    listInvoices: (query: InvoiceQuery): Promise<Result<{ rows: readonly InvoiceRow[]; total: number }, BillingError>> => run(() => repo.listInvoices({ ...query, page: Math.max(1, query.page) })),
    async getInvoice(id: string): Promise<Result<InvoiceDetail, BillingError>> {
      const r = await run(() => repo.getInvoice(id));
      return !r.ok ? r : r.value ? ok(r.value) : err({ code: 'not-found' });
    },
    orderMoney: (orderId: string): Promise<Result<OrderMoney, BillingError>> => run(() => repo.orderMoney(orderId)),
    listPayments: (page: number): Promise<Result<{ rows: readonly PaymentRow[]; total: number }, BillingError>> => run(() => repo.listPayments(Math.max(1, page))),
    pendingRefunds: () => run(() => repo.pendingRefunds()),
    taxRates: (): Promise<Result<readonly TaxRate[], BillingError>> => run(() => repo.taxRates()),

    createInvoice(orderId: string, dueAt: string, notes: string) {
      const due = dueOf(dueAt);
      return due.ok ? run(() => repo.createInvoice(orderId, due.value, notes.trim().slice(0, 1000) || null)) : Promise.resolve(due);
    },
    async updateDraft(invoiceId: string, dueAt: string, notes: string) {
      const due = dueOf(dueAt);
      if (!due.ok) return due;
      return run(async () => (await repo.updateDraft(invoiceId, due.value, notes.trim().slice(0, 1000) || null), true as const));
    },
    async issueInvoice(invoiceId: string, dueAt: string) {
      const due = dueOf(dueAt);
      return due.ok ? run(() => repo.issueInvoice(invoiceId, due.value)) : due;
    },
    voidInvoice(invoiceId: string, reason: string) {
      if (reason.trim().length < 3) return Promise.resolve(err<BillingError>({ code: 'invalid', field: 'reason' }));
      return run(async () => (await repo.voidInvoice(invoiceId, reason.trim()), true as const));
    },

    async recordPayment(raw: unknown): Promise<Result<{ id: string; duplicate: boolean }, BillingError>> {
      const parsed = paymentInputSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: fieldOf(parsed.error.issues[0]) });
      return run(() => repo.recordPayment(parsed.data));
    },
    async requestRefund(raw: unknown): Promise<Result<string, BillingError>> {
      const parsed = refundRequestSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: fieldOf(parsed.error.issues[0]) });
      return run(() => repo.requestRefund(parsed.data));
    },
    decideRefund: (refundId: string, approve: boolean, note: string) => run(async () => (await repo.decideRefund(refundId, approve, note.trim().slice(0, 300) || null), true as const)),

    async setDefaultTaxRate(raw: unknown): Promise<Result<true, BillingError>> {
      const parsed = taxRateSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: fieldOf(parsed.error.issues[0]) });
      return run(async () => (await repo.setDefaultTaxRate(parsed.data.name, parsed.data.percent), true as const));
    },
  };
}

export type Billing = ReturnType<typeof createBilling>;
