import { describe, expect, it } from 'vitest';
import { evaluateSession, parseStamp } from './session';

const now = Date.UTC(2026, 10, 2, 12, 0, 0);
const opts = { now, idleMinutes: 30, absoluteHours: 12 };

describe('session age', () => {
  it('allows recent activity, expires idle and long sessions, and trusts missing stamps only as new', () => {
    expect(evaluateSession({ ...opts, seen: now - 5 * 60_000, start: now - 60 * 60_000 })).toBe('ok');
    expect(evaluateSession({ ...opts, seen: now - 31 * 60_000, start: now - 60 * 60_000 })).toBe('idle');
    expect(evaluateSession({ ...opts, seen: now - 60_000, start: now - 13 * 3_600_000 })).toBe('absolute');
    expect(evaluateSession(opts)).toBe('ok');
  });
  it('ignores junk cookie values', () => {
    expect(parseStamp('abc')).toBeUndefined();
    expect(parseStamp('-5')).toBeUndefined();
    expect(parseStamp(String(now))).toBe(now);
  });
});
