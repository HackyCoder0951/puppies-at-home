import { err, ok, type Result } from '@backend/kernel';
import type { InvoiceDetail, InvoiceQuery, InvoiceRow, OrderMoney, PaymentRow, TaxRate } from '../domain';
import { emptyRegistry, type GatewayRegistry } from './gateway';
import { RepositoryError, type BillingRepository } from './ports';
import { dueDateSchema, paymentInputSchema, refundRequestSchema, taxRateSchema } from './schemas';

export type BillingError =
  | { code: 'invalid'; field?: string }
  | { code: 'rule'; message: string }
  | { code: 'forbidden' }
  | { code: 'not-found' }
  | { code: 'unavailable' };

const fieldOf = (issue: { path: PropertyKey[]; message: string } | undefined) => String(issue?.path.at(-1) ?? issue?.message ?? '');

export interface BillingOptions { gateways?: GatewayRegistry; siteUrl?: string }

export function createBilling(repo: BillingRepository, options: BillingOptions = {}) {
  const gateways = options.gateways ?? emptyRegistry;
  const siteUrl = (options.siteUrl ?? 'http://localhost:3000').replace(/\/$/, '');
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
    listPayments: (page: number, customerId?: string): Promise<Result<{ rows: readonly PaymentRow[]; total: number }, BillingError>> => run(() => repo.listPayments(Math.max(1, page), customerId)),
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
    /** Manual refunds finish on approval; gateway refunds call the gateway, then record its answer (or the failure). */
    decideRefund: (refundId: string, approve: boolean, note: string) =>
      run(async () => {
        const outcome = await repo.decideRefund(refundId, approve, note.trim().slice(0, 300) || null);
        if (outcome !== 'approved') return outcome;
        const context = await repo.refundContext(refundId);
        const gateway = context ? gateways.get(context.gateway) : undefined;
        if (!context || !gateway) {
          await repo.failGatewayRefund(refundId, 'The payment gateway is not configured');
          throw new RepositoryError('rule', 'Approved, but the payment gateway is not configured, so the refund could not be sent. Mark it as failed and refund in the gateway dashboard.');
        }
        try {
          const sent = await gateway.refund({ gatewayRef: context.gatewayRef, amountMinor: context.amountMinor, reason: context.reason, idempotencyKey: `refund:${refundId}` });
          await repo.completeGatewayRefund(refundId, sent.gatewayRef);
          return 'processed' as const;
        } catch (error) {
          await repo.failGatewayRefund(refundId, String(error));
          throw new RepositoryError('rule', 'The gateway did not accept the refund; it is marked failed. Check the gateway dashboard before trying again.');
        }
      }),

    paymentGateways: () => gateways.list().map((g) => ({ id: g.id, name: g.displayName, mode: g.mode })),

    /** Payment link for the open balance of an issued invoice; the amount always comes from the invoice, never the browser. */
    async createPaymentLink(invoiceId: string, gatewayId: string): Promise<Result<{ url: string }, BillingError>> {
      const gateway = gateways.get(gatewayId);
      if (!gateway) return err({ code: 'rule', message: 'That payment gateway is not enabled.' });
      return run(async () => {
        const invoice = await repo.getInvoice(invoiceId);
        if (!invoice) throw new RepositoryError('not-found', 'invoice');
        if (invoice.status !== 'issued' && invoice.status !== 'partially_paid' && invoice.status !== 'overdue') throw new RepositoryError('rule', 'Issue the invoice before creating a payment link.');
        const balance = invoice.totalMinor - invoice.paidMinor;
        if (balance <= 0) throw new RepositoryError('rule', 'This invoice has nothing left to pay.');
        const pending = invoice.payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amountMinor, 0);
        if (pending >= balance) throw new RepositoryError('rule', 'There is already an open payment link for the full balance.');
        const amountMinor = balance - pending;
        const checkout = await gateway.createCheckout({
          orderNumber: invoice.orderNumber, invoiceNumber: invoice.number, orderId: invoice.orderId, invoiceId: invoice.id, amountMinor, currency: invoice.currency,
          successUrl: `${siteUrl}/payment/success`, cancelUrl: `${siteUrl}/payment/cancelled`, idempotencyKey: `link:${invoice.id}:${invoice.paidMinor}:${pending}`,
        });
        await repo.startGatewayPayment({ orderId: invoice.orderId, invoiceId: invoice.id, gateway: gateway.id, gatewayRef: checkout.gatewayRef, amountMinor, url: checkout.url });
        return { url: checkout.url };
      });
    },

    async setDefaultTaxRate(raw: unknown): Promise<Result<true, BillingError>> {
      const parsed = taxRateSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: fieldOf(parsed.error.issues[0]) });
      return run(async () => (await repo.setDefaultTaxRate(parsed.data.name, parsed.data.percent), true as const));
    },
  };
}

export type Billing = ReturnType<typeof createBilling>;
