import { describe, expect, it } from 'vitest';
import { err, map, ok, unwrap, unwrapOr } from './result';

describe('Result', () => {
  it('maps Ok values and leaves Err untouched', () => {
    expect(map(ok(2), (n) => n * 2)).toEqual(ok(4));
    const e = err('bad');
    expect(map(e, (n: number) => n * 2)).toBe(e);
  });
  it('unwrapOr falls back on Err', () => {
    expect(unwrapOr(ok(1), 9)).toBe(1);
    expect(unwrapOr(err('x'), 9)).toBe(9);
  });
  it('unwrap throws on Err', () => {
    expect(unwrap(ok(3))).toBe(3);
    expect(() => unwrap(err(new Error('boom')))).toThrow();
  });
});
