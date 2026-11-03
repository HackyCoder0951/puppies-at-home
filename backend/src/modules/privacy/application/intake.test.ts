import { describe, expect, it } from 'vitest';
import { createPublicIntake } from './intake';

const valid = { name: 'Aisha Khan', contact: 'aisha@dev.test', type: 'access', details: 'copy please', elapsedMs: 9000 };
const make = (wait = 0, fail = false) => {
  const stored: unknown[] = [];
  const intake = createPublicIntake({ store: { submit: async (i) => { if (fail) throw new Error('db'); stored.push(i); } }, limiter: { hit: async () => wait } });
  return { intake, stored };
};

describe('public privacy intake', () => {
  it('stores a valid request once', async () => {
    const t = make();
    expect(await t.intake.submit(valid, 'ip1')).toEqual({ ok: true, value: true });
    expect(t.stored).toEqual([{ name: 'Aisha Khan', contact: 'aisha@dev.test', type: 'access', details: 'copy please' }]);
  });
  it('answers bots with success but stores nothing (honeypot and too-fast submit)', async () => {
    const t = make();
    expect((await t.intake.submit({ ...valid, website: 'http://spam' }, 'ip1')).ok).toBe(true);
    expect((await t.intake.submit({ ...valid, elapsedMs: 300 }, 'ip1')).ok).toBe(true);
    expect(t.stored).toEqual([]);
  });
  it('validates, rate limits and reports storage failures', async () => {
    expect(await make().intake.submit({ ...valid, type: 'sell' }, 'ip1')).toEqual({ ok: false, error: { code: 'invalid', field: 'type' } });
    expect(await make().intake.submit({ ...valid, name: 'A' }, 'ip1')).toEqual({ ok: false, error: { code: 'invalid', field: 'name' } });
    expect(await make(120).intake.submit(valid, 'ip1')).toEqual({ ok: false, error: { code: 'rate-limited', retryAfterSeconds: 120 } });
    expect(await make(0, true).intake.submit(valid, 'ip1')).toEqual({ ok: false, error: { code: 'unavailable' } });
  });
});
