import { describe, expect, it } from 'vitest';
import { formatMoney, formatRate, toMinor } from '../domain';
import { createBilling } from './billing';
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
