import { describe, expect, it } from 'vitest';
import { EnvError, parseEnv } from './env';

describe('parseEnv', () => {
  it('applies safe defaults', () => {
    const env = parseEnv({});
    expect(env.DATA_SOURCE).toBe('mock');
    expect(env.APP_ENV).toBe('local');
    expect(env.FEATURE_PUBLIC_CURTAIN).toBe(true);
    expect(env.PRIVACY_CONTACT_EMAIL).toBeUndefined();
  });
  it('parses booleans and empty optional values', () => {
    const env = parseEnv({ FEATURE_ROAMING_MASCOT: 'false', PRIVACY_CONTACT_EMAIL: '' });
    expect(env.FEATURE_ROAMING_MASCOT).toBe(false);
    expect(env.PRIVACY_CONTACT_EMAIL).toBeUndefined();
  });
  it('rejects invalid values with a readable error', () => {
    expect(() => parseEnv({ DATA_SOURCE: 'oracle' })).toThrow(EnvError);
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: 'nope' })).toThrow(EnvError);
  });
  it('requires Supabase settings when the data source is supabase', () => {
    expect(() => parseEnv({ DATA_SOURCE: 'supabase' })).toThrow(EnvError);
    const env = parseEnv({ DATA_SOURCE: 'supabase', NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:55321', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'a'.repeat(30) });
    expect(env.DATA_SOURCE).toBe('supabase');
  });
  it('requires cron, hash salt and rate-limit store in production', () => {
    expect(() => parseEnv({ APP_ENV: 'production' })).toThrow(EnvError);
    const ok = parseEnv({ APP_ENV: 'production', CRON_SECRET: 'c'.repeat(24), IP_HASH_SALT: 's'.repeat(16), RATE_LIMIT_ENABLED: 'false' });
    expect(ok.APP_ENV).toBe('production');
  });
  it('applies session defaults and rejects out-of-range values', () => {
    const env = parseEnv({});
    expect(env.SESSION_IDLE_MINUTES).toBe(30);
    expect(env.LOGIN_LOCK_THRESHOLD).toBe(10);
    expect(() => parseEnv({ SESSION_IDLE_MINUTES: '1' })).toThrow(EnvError);
  });
});
