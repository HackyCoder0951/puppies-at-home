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
  it('registers stripe only with both keys, and rejects malformed ones', () => {
    expect(parseEnv({}).PAYMENT_GATEWAYS).toEqual(['manual']);
    expect(() => parseEnv({ PAYMENT_GATEWAYS: 'manual,stripe' })).toThrow(EnvError);
    const ok = parseEnv({ PAYMENT_GATEWAYS: ' manual, Stripe ', STRIPE_SECRET_KEY: 'sk_test_abc123', STRIPE_WEBHOOK_SECRET: 'whsec_abc123' });
    expect(ok.PAYMENT_GATEWAYS).toEqual(['manual', 'stripe']);
    expect(() => parseEnv({ STRIPE_SECRET_KEY: 'pk_live_nope' })).toThrow(EnvError);
  });
  it('tolerates pasted spaces and quotes but still rejects a wrong kind of value', () => {
    const ok = parseEnv({ PAYMENT_GATEWAYS: 'manual,stripe', STRIPE_SECRET_KEY: ' "sk_test_abc123" ', STRIPE_WEBHOOK_SECRET: "'whsec_abc123'  " });
    expect(ok.STRIPE_WEBHOOK_SECRET).toBe('whsec_abc123');
    expect(ok.STRIPE_SECRET_KEY).toBe('sk_test_abc123');
    expect(() => parseEnv({ STRIPE_WEBHOOK_SECRET: 'we_1Abc23' })).toThrow(EnvError);   // an endpoint id is not the signing secret
  });
  it('requires every WhatsApp Cloud setting when that provider is chosen', () => {
    expect(parseEnv({}).WHATSAPP_PROVIDER).toBe('none');
    expect(() => parseEnv({ WHATSAPP_PROVIDER: 'cloud' })).toThrow(EnvError);
    const ok = parseEnv({ WHATSAPP_PROVIDER: 'cloud', WHATSAPP_ACCESS_TOKEN: 't'.repeat(30), WHATSAPP_PHONE_NUMBER_ID: '123456789012', WHATSAPP_APP_SECRET: 's'.repeat(32), WHATSAPP_VERIFY_TOKEN: 'v'.repeat(20) });
    expect(ok.WHATSAPP_API_VERSION).toBe('v21.0');
  });
  it('needs the NVIDIA key only for the live assistant and keeps safe defaults', () => {
    const base = parseEnv({});
    expect(base.ASSISTANT_MODE).toBe('mock');
    expect(base.NVIDIA_BASE_URL).toBe('https://integrate.api.nvidia.com/v1');
    expect(() => parseEnv({ ASSISTANT_MODE: 'live' })).toThrow(EnvError);
    expect(parseEnv({ ASSISTANT_MODE: 'live', NVIDIA_API_KEY: 'nvapi-' + 'x'.repeat(30) }).NVIDIA_MODEL).toBe('nvidia/nemotron-3.5-lightning-30b-a3b');
  });
});
