import { describe, expect, it } from 'vitest';
import { formatMoney, nextDeliveryStatuses, nextOrderStatuses, toMinor } from '../domain';
import { createCommerce } from './commerce';
import { RepositoryError, type CommerceRepository } from './ports';

const customerId = '11111111-1111-4111-8111-111111111111';
const valid = { customerId, type: 'local', items: [{ description: 'Maltipoo puppy', quantity: 1, unitMinor: '4,500.50' }], depositMinor: '1000' };

describe('money', () => {
  it('converts AED text to fils and back', () => {
    expect(toMinor('4,500.50')).toBe(450050);
    expect(toMinor('12')).toBe(1200);
    for (const bad of ['', '-5', '1.234', 'abc', '1e5']) expect(toMinor(bad)).toBeUndefined();
    expect(formatMoney(450000)).toBe('AED 4,500');
    expect(formatMoney(450050)).toBe('AED 4,500.50');
  });
});

describe('transition hints mirror the database machine', () => {
  it('local orders may go straight to delivered; imported may not', () => {
    expect(nextOrderStatuses('deposit_paid', 'local')).toContain('delivered');
    expect(nextOrderStatuses('deposit_paid', 'imported')).not.toContain('delivered');
    expect(nextOrderStatuses('completed', 'local')).toEqual([]);
    expect(nextOrderStatuses('cancelled', 'imported')).toEqual([]);
    expect(nextDeliveryStatuses('delivered')).toEqual([]);
    expect(nextDeliveryStatuses('delayed')).not.toContain('scheduled');
  });
});

describe('commerce use cases', () => {
  const make = (over: Partial<CommerceRepository> = {}) => {
    const created: unknown[] = [];
    const repo = { createOrder: async (i: unknown) => (created.push(i), { id: 'o1', number: 'TP-2026-000001' }), ...over } as unknown as CommerceRepository;
    return { commerce: createCommerce(repo), created };
  };

  it('creates an order with amounts in minor units', async () => {
    const { commerce, created } = make();
    expect((await commerce.createOrder(valid)).ok).toBe(true);
    expect(created[0]).toMatchObject({ items: [{ unitMinor: 450050, quantity: 1 }], depositMinor: 100000, puppyId: null });
  });

  it('rejects bad input without calling the repository', async () => {
    const { commerce, created } = make();
    expect(await commerce.createOrder({ ...valid, items: [] })).toMatchObject({ ok: false, error: { code: 'invalid' } });
    expect(await commerce.createOrder({ ...valid, depositMinor: '9999' })).toEqual({ ok: false, error: { code: 'invalid', field: 'deposit' } });
    expect(await commerce.createOrder({ ...valid, items: [{ description: 'x', quantity: 1, unitMinor: '1' }] })).toMatchObject({ ok: false });
    expect(created).toEqual([]);
  });

  it('passes database rule messages through and maps other failures', async () => {
    const rule = make({ transitionOrder: async () => { throw new RepositoryError('rule', 'Invalid order transition from new to delivered'); } });
    expect(await rule.commerce.transitionOrder('o1', 'delivered', '')).toEqual({ ok: false, error: { code: 'rule', message: 'Invalid order transition from new to delivered' } });
    const denied = make({ transitionOrder: async () => { throw new RepositoryError('forbidden', 'x'); } });
    expect(await denied.commerce.transitionOrder('o1', 'cancelled', 'x')).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect(await rule.commerce.transitionOrder('o1', 'teleported', '')).toEqual({ ok: false, error: { code: 'invalid', field: 'status' } });
  });
});
