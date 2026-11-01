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
});
