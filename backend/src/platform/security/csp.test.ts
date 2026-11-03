import { describe, expect, it } from 'vitest';
import { adminCsp, newNonce, originOf, publicCsp } from './csp';

const supabaseOrigin = 'https://abc.supabase.co';

describe('adminCsp', () => {
  const policy = adminCsp('NONCE123', { supabaseOrigin });
  it('allows scripts only with the nonce and never inline or eval', () => {
    expect(policy).toContain("script-src 'self' 'nonce-NONCE123' 'strict-dynamic'");
    expect(policy).not.toMatch(/script-src[^;]*unsafe-(inline|eval)/);
  });
  it('blocks plugins, framing, foreign bases and form targets', () => {
    for (const d of ["object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"]) expect(policy).toContain(d);
  });
  it('limits connections and images to this site and the Supabase project', () => {
    expect(policy).toContain("connect-src 'self' https://abc.supabase.co wss://abc.supabase.co");
    expect(policy).toContain("img-src 'self' data: blob: https://abc.supabase.co");
  });
  it('allows eval and a dev websocket only in development', () => {
    expect(adminCsp('n', { dev: true })).toContain("'unsafe-eval'");
    expect(policy).not.toContain('ws:;');
  });
});

describe('publicCsp', () => {
  it('keeps every directive except inline scripts tight, and upgrades requests in production', () => {
    const p = publicCsp({ supabaseOrigin });
    expect(p).toContain("script-src 'self' 'unsafe-inline'");
    expect(p).toContain("object-src 'none'");
    expect(p).toContain('upgrade-insecure-requests');
    expect(publicCsp({ dev: true })).not.toContain('upgrade-insecure-requests');
  });
});

describe('helpers', () => {
  it('makes distinct nonces and extracts origins', () => {
    expect(newNonce()).not.toBe(newNonce());
    expect(originOf('https://abc.supabase.co/rest/v1')).toBe(supabaseOrigin);
    expect(originOf('')).toBeUndefined();
    expect(originOf('nonsense')).toBeUndefined();
  });
});
