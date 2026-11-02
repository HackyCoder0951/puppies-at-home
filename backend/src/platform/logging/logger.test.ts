import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetEnvCache } from '@backend/config';
import { createLogger } from './logger';

afterEach(() => {
  vi.restoreAllMocks();
  resetEnvCache();
});

describe('logger', () => {
  it('redacts personal and secret fields by key name', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    createLogger().info('hello', { email: 'a@b.co', nested: { phone: '+971500000000', count: 2 }, token: 'x' });
    const line = JSON.parse(String(spy.mock.calls[0]?.[0]));
    expect(line).toMatchObject({ msg: 'hello', email: '[redacted]', token: '[redacted]', nested: { phone: '[redacted]', count: 2 } });
  });
  it('merges child context', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    createLogger({ requestId: 'r1' }).child({ module: 'crm' }).info('x');
    expect(JSON.parse(String(spy.mock.calls[0]?.[0]))).toMatchObject({ requestId: 'r1', module: 'crm' });
  });
});
