import { describe, expect, it } from 'vitest';
import { toE164 } from '../../domain';
import { InMemoryEnquiryStore, InMemoryRateLimiter } from './memory';
import { createEnquiryService } from '../../application';

const T0 = new Date('2026-01-01T10:00:00Z').getTime();
const make = (limit = 5, nowMs = T0 + 60_000) => {
  const store = new InMemoryEnquiryStore();
  let n = 0;
  const svc = createEnquiryService({
    store, limiter: new InMemoryRateLimiter(limit, 60_000, () => nowMs), clock: { now: () => new Date(nowMs) },
    ids: { next: () => `id-${++n}` }, consentTextVersion: 'v1',
  });
  return { store, svc };
};
const valid = { source: 'contact', name: 'Sam Test', phone: '+971 50 123 4567', shownAt: T0 };

describe('toE164', () => {
  it('normalises and rejects', () => {
    expect(toE164('+971 (50) 123-4567')).toBe('+971501234567');
    expect(toE164('00971501234567')).toBe('+971501234567');
    expect(toE164('0501234567')).toBeUndefined();
    expect(toE164('abc')).toBeUndefined();
  });
});

describe('enquiry service', () => {
  it('stores a valid enquiry with unticked-by-default consent', async () => {
    const { svc, store } = make();
    const out = await svc.submit(valid, 'ip1');
    expect(out).toEqual({ ok: true, reference: 'id-1' });
    expect(store.saved[0]?.phoneE164).toBe('+971501234567');
    expect(store.saved[0]?.consent).toMatchObject({ marketing: false, whatsappUpdates: false, textVersion: 'v1' });
  });
  it('returns field errors for bad input', async () => {
    const { svc, store } = make();
    const out = await svc.submit({ ...valid, name: 'x', phone: '123', email: 'nope' }, 'ip1');
    expect(out.ok).toBe(false);
    if (!out.ok && out.code === 'validation') expect(Object.keys(out.fields).sort()).toEqual(['email', 'name', 'phone']);
    expect(store.saved).toHaveLength(0);
  });
  it('silently drops honeypot and too-fast submissions', async () => {
    const { svc, store } = make();
    expect((await svc.submit({ ...valid, website: 'http://spam' }, 'a')).ok).toBe(true);
    expect((await svc.submit({ ...valid, shownAt: T0 + 60_000 - 500 }, 'b')).ok).toBe(true);
    expect(store.saved).toHaveLength(0);
  });
  it('rate limits per caller', async () => {
    const { svc } = make(2);
    await svc.submit(valid, 'ip'); await svc.submit(valid, 'ip');
    const third = await svc.submit(valid, 'ip');
    expect(third).toMatchObject({ ok: false, code: 'rate-limited' });
    expect((await svc.submit(valid, 'other')).ok).toBe(true);
  });
  it('reports unexpected store failures', async () => {
    const svc = createEnquiryService({
      store: { save: async () => { throw new Error('down'); } }, limiter: new InMemoryRateLimiter(), clock: { now: () => new Date() },
      ids: { next: () => 'x' }, consentTextVersion: 'v1',
    });
    expect(await svc.submit({ ...valid, shownAt: 0 }, 'ip')).toEqual({ ok: false, code: 'unexpected' });
  });
});
