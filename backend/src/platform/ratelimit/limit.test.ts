import { beforeEach, describe, expect, it } from 'vitest';
import { resetEnvCache } from '@backend/config';
import { clientIp, hashIdentifier } from './identify';
import { limit, resetMemoryLimits } from './limit';

beforeEach(() => {
  resetMemoryLimits();
  resetEnvCache();
});

describe('rate limiting (memory fallback)', () => {
  it('allows up to the limit then blocks with a retry time', async () => {
    for (let i = 0; i < 5; i++) expect((await limit('RL-PUB-1', 'visitor-a')).allowed).toBe(true);
    const blocked = await limit('RL-PUB-1', 'visitor-a');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
  it('keeps identifiers separate and never uses the plain value as the key', async () => {
    for (let i = 0; i < 6; i++) await limit('RL-PUB-1', 'visitor-a');
    expect((await limit('RL-PUB-1', 'visitor-b')).allowed).toBe(true);
    expect(hashIdentifier('visitor-a')).not.toContain('visitor');
    expect(hashIdentifier(' Visitor-A ')).toBe(hashIdentifier('visitor-a'));
  });
  it('reads the first forwarded address', () => {
    expect(clientIp({ get: (n: string) => (n === 'x-forwarded-for' ? '1.2.3.4, 5.6.7.8' : null) })).toBe('1.2.3.4');
    expect(clientIp({ get: () => null })).toBe('local');
  });
});
