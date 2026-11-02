import { describe, expect, it } from 'vitest';
import { formatMoney, formatRate, toMinor } from '../domain';
import { createBilling } from './billing';
import { registryOf } from './gateway';
import { RepositoryError, type BillingRepository } from './ports';

const orderId = '11111111-1111-4111-8111-111111111111';
const payment = { orderId, invoiceId: null, reference: 'cash-receipt-0001', method: 'cash', amountMinor: '1,000.50' };

describe('billing money helpers', () => {
  it('formats amounts and rates', () => {
    expect(toMinor('1,000.50')).toBe(100050);
    expect(formatMoney(504000)).toBe('AED 5,040');
    expect(formatRate(500)).toBe('5%');
    expect(formatRate(750)).toBe('7.5%');
  });
});

describe('billing use cases', () => {
  const make = (over: Partial<BillingRepository> = {}) => {
    const calls: unknown[] = [];
    const repo = { recordPayment: async (i: unknown) => (calls.push(i), { id: 'p1', duplicate: false }), setDefaultTaxRate: async (n: string, b: number) => void calls.push([n, b]), ...over } as unknown as BillingRepository;
    return { billing: createBilling(repo), calls };
  };

  it('records a payment with the amount in minor units', async () => {
    const { billing, calls } = make();
    expect((await billing.recordPayment(payment)).ok).toBe(true);
    expect(calls[0]).toMatchObject({ amountMinor: 100050, method: 'cash', invoiceId: null });
  });

  it('rejects short references, unknown methods and bad amounts before the database', async () => {
    const { billing, calls } = make();
    expect(await billing.recordPayment({ ...payment, reference: 'abc' })).toEqual({ ok: false, error: { code: 'invalid', field: 'reference' } });
    expect(await billing.recordPayment({ ...payment, method: 'bitcoin' })).toMatchObject({ ok: false, error: { code: 'invalid' } });
    expect(await billing.recordPayment({ ...payment, amountMinor: '0' })).toMatchObject({ ok: false });
    expect(await billing.recordPayment({ ...payment, amountMinor: '12.345' })).toMatchObject({ ok: false });
    expect(calls).toEqual([]);
  });

  it('converts a percentage to basis points and validates the range', async () => {
    const { billing, calls } = make();
    expect((await billing.setDefaultTaxRate({ name: 'UAE VAT', percent: '7.5' })).ok).toBe(true);
    expect(calls[0]).toEqual(['UAE VAT', 750]);
    expect(await billing.setDefaultTaxRate({ name: 'Bad', percent: '120' })).toMatchObject({ ok: false });
  });

  it('shows our own rule messages and maps denials', async () => {
    const rule = make({ issueInvoice: async () => { throw new RepositoryError('rule', 'Only a draft invoice can be issued'); } });
    expect(await rule.billing.issueInvoice('i1', '')).toEqual({ ok: false, error: { code: 'rule', message: 'Only a draft invoice can be issued' } });
    const denied = make({ voidInvoice: async () => { throw new RepositoryError('forbidden', 'x'); } });
    expect(await denied.billing.voidInvoice('i1', 'mistake')).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect(await denied.billing.voidInvoice('i1', 'x')).toEqual({ ok: false, error: { code: 'invalid', field: 'reason' } });
  });
});

describe('gateway use cases', () => {
  const invoice = { id: 'i1', number: 'INV-1', orderId: 'o1', orderNumber: 'TP-1', status: 'issued', totalMinor: 105000, paidMinor: 0, currency: 'AED', payments: [] as { status: string; amountMinor: number }[] };
  const gateway = (calls: unknown[]) => ({ id: 'stripe', displayName: 'Stripe', mode: 'test' as const, createCheckout: async (i: unknown) => (calls.push(i), { url: 'https://pay.test/cs_1', gatewayRef: 'cs_1' }), verifyWebhook: async () => null, refund: async (i: unknown) => (calls.push(i), { gatewayRef: 're_1' }) });
  const make = (over: Partial<BillingRepository> = {}, inv = invoice) => {
    const calls: unknown[] = [];
    const started: unknown[] = [];
    const repo = { getInvoice: async () => inv, startGatewayPayment: async (i: unknown) => (started.push(i), 'p1'), ...over } as unknown as BillingRepository;
    return { billing: createBilling(repo, { gateways: registryOf([gateway(calls)]), siteUrl: 'https://teddypups.test/' }), calls, started };
  };

  it('creates a link for exactly the open balance and records a pending payment', async () => {
    const t = make();
    expect(await t.billing.createPaymentLink('i1', 'stripe')).toEqual({ ok: true, value: { url: 'https://pay.test/cs_1' } });
    expect(t.calls[0]).toMatchObject({ amountMinor: 105000, currency: 'AED', orderId: 'o1', successUrl: 'https://teddypups.test/?payment=success', idempotencyKey: 'link:i1:0:0' });
    expect(t.started[0]).toMatchObject({ gateway: 'stripe', gatewayRef: 'cs_1', amountMinor: 105000 });
  });

  it('refuses drafts, paid invoices, an open link for the full balance and gateways that are not enabled', async () => {
    expect(await make({}, { ...invoice, status: 'draft' }).billing.createPaymentLink('i1', 'stripe')).toMatchObject({ ok: false, error: { code: 'rule' } });
    expect(await make({}, { ...invoice, paidMinor: 105000 }).billing.createPaymentLink('i1', 'stripe')).toMatchObject({ ok: false, error: { code: 'rule' } });
    expect(await make({}, { ...invoice, payments: [{ status: 'pending', amountMinor: 105000 }] }).billing.createPaymentLink('i1', 'stripe')).toMatchObject({ ok: false, error: { message: 'There is already an open payment link for the full balance.' } });
    expect(await make().billing.createPaymentLink('i1', 'razorpay')).toMatchObject({ ok: false, error: { code: 'rule' } });
  });

  it('approving a gateway refund calls the gateway then records the result; a gateway error marks it failed', async () => {
    const done: string[] = [];
    const base = { decideRefund: async () => 'approved' as const, refundContext: async () => ({ refundId: 'r1', amountMinor: 30000, gateway: 'stripe', gatewayRef: 'cs_1', reason: 'returned' }), completeGatewayRefund: async (_id: string, ref: string) => void done.push(`complete ${ref}`), failGatewayRefund: async (_id: string, e: string) => void done.push(`fail ${e}`) };
    const ok = make(base);
    expect(await ok.billing.decideRefund('r1', true, '')).toEqual({ ok: true, value: 'processed' });
    expect(ok.calls[0]).toMatchObject({ gatewayRef: 'cs_1', amountMinor: 30000, idempotencyKey: 'refund:r1' });
    const bad = createBilling({ ...base } as unknown as BillingRepository, { gateways: registryOf([{ ...gateway([]), refund: async () => { throw new Error('boom'); } }]) });
    expect(await bad.decideRefund('r1', true, '')).toMatchObject({ ok: false, error: { code: 'rule' } });
    expect(done).toEqual(['complete re_1', 'fail Error: boom']);
  });

  it('manual refunds finish without a gateway call', async () => {
    const t = make({ decideRefund: async () => 'processed' as const });
    expect(await t.billing.decideRefund('r1', true, '')).toEqual({ ok: true, value: 'processed' });
    expect(t.calls).toEqual([]);
  });
});
