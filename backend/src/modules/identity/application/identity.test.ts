import { describe, expect, it } from 'vitest';
import { createIdentity, type IdentityDeps } from './identity';
import type { AuditEvent } from './ports';

const member = { userId: 'u1', email: 'a@b.co', fullName: 'Asha Rao', role: 'super_admin' as const, mfaRequired: false };
let mfa: { currentLevel: 'aal1' | 'aal2' | null; nextLevel: 'aal1' | 'aal2' | null; factors: string[] } = { currentLevel: 'aal1', nextLevel: 'aal1', factors: [] };
const caller = { ip: '1.2.3.4', userAgent: 'test' };

function setup(over: Partial<IdentityDeps> = {}) {
  const audit: AuditEvent[] = [];
  const attempts: boolean[] = [];
  let signedOut = 0;
  const deps: IdentityDeps = {
    auth: {
      signInWithPassword: async (_e, p) => (p === 'correct-password-1' ? { ok: true, user: { userId: 'u1', email: 'a@b.co' } } : { ok: false, reason: 'invalid' }),
      signOut: async () => void signedOut++,
      sendPasswordReset: async () => undefined,
      updatePassword: async () => ({ ok: true }),
      currentUser: async () => ({ userId: 'u1', email: 'a@b.co' }),
      mfaState: async () => mfa,
      enrollTotp: async () => ({ factorId: 'f1', qrSvg: '<svg/>', secret: 'ABC' }),
      verifyTotp: async (_f, code) => code === '123456',
      removeFactor: async () => true,
    },
    staff: { find: async (id) => (id === 'u1' ? member : null) },
    attempts: { record: async (_e, _i, success) => (attempts.push(success), false) },
    audit: { record: async (e) => void audit.push(e) },
    signInLimiter: { hit: async () => 0 },
    resetLimiter: { hit: async () => 0 },
    hasher: { hash: (v) => `h(${v})` },
    ...over,
  };
  return { identity: createIdentity(deps), auth: deps.auth, audit, attempts, signedOut: () => signedOut };
}

describe('identity sign-in', () => {
  it('signs in a staff member and audits it without storing the email in clear', async () => {
    const { identity, audit, attempts } = setup();
    const r = await identity.signIn({ email: ' A@B.co ', password: 'correct-password-1' }, caller);
    expect(r).toEqual({ ok: true, value: member });
    expect(attempts).toEqual([true]);
    expect(audit.map((e) => e.action)).toEqual(['auth.sign_in']);
    expect(JSON.stringify(audit)).not.toContain('a@b.co');
  });

  it('gives the same error for a wrong password and records the failure', async () => {
    const { identity, audit, attempts } = setup();
    const r = await identity.signIn({ email: 'a@b.co', password: 'wrong' }, caller);
    expect(r).toEqual({ ok: false, error: { code: 'invalid-credentials' } });
    expect(attempts).toEqual([false]);
    expect(audit[0]?.action).toBe('auth.sign_in_failed');
  });

  it('reports a lock once the attempt log says so', async () => {
    const { identity } = setup({ attempts: { record: async () => true } });
    const r = await identity.signIn({ email: 'a@b.co', password: 'wrong' }, caller);
    expect(r).toEqual({ ok: false, error: { code: 'locked' } });
  });

  it('rejects a valid login that has no active staff profile and ends the session', async () => {
    const { identity, signedOut, audit } = setup({ staff: { find: async () => null } });
    const r = await identity.signIn({ email: 'a@b.co', password: 'correct-password-1' }, caller);
    expect(r).toEqual({ ok: false, error: { code: 'invalid-credentials' } });
    expect(signedOut()).toBe(1);
    expect(audit[0]?.action).toBe('auth.sign_in_denied');
  });

  it('rate limits before touching the identity provider', async () => {
    let calls = 0;
    const base = setup();
    const { identity } = setup({
      signInLimiter: { hit: async () => 30 },
      auth: { ...base.auth, signInWithPassword: async () => (calls++, { ok: false, reason: 'invalid' }) },
    });
    const r = await identity.signIn({ email: 'a@b.co', password: 'x' }, caller);
    expect(r).toEqual({ ok: false, error: { code: 'rate-limited', retryAfterSeconds: 30 } });
    expect(calls).toBe(0);
  });

  it('rejects malformed input', async () => {
    const { identity } = setup();
    expect((await identity.signIn({ email: 'nope', password: 'x' }, caller)).ok).toBe(false);
    expect((await identity.signIn({ email: 'a@b.co', password: '' }, caller)).ok).toBe(false);
  });
});

describe('identity password reset', () => {
  it('answers the same for unknown addresses and audits the request', async () => {
    const { identity, audit } = setup();
    expect((await identity.requestPasswordReset({ email: 'who@x.co' }, 'https://x/cb', caller)).ok).toBe(true);
    expect(audit[0]?.action).toBe('auth.password_reset_requested');
  });

  it('enforces the password policy and needs a session', async () => {
    const { identity } = setup();
    expect(await identity.resetPassword('short')).toEqual({ ok: false, error: { code: 'weak-password', reason: 'too-short' } });
    expect((await identity.resetPassword('a-long-enough-password')).ok).toBe(true);
    const none = setup({ auth: { ...setup().auth, currentUser: async () => null } });
    expect(await none.identity.resetPassword('a-long-enough-password')).toEqual({ ok: false, error: { code: 'no-session' } });
  });
});

describe('identity second factor', () => {
  it('asks for a code when a factor exists, for enrolment when required, and nothing otherwise', async () => {
    const { identity } = setup();
    mfa = { currentLevel: 'aal1', nextLevel: 'aal2', factors: ['f1'] };
    expect(await identity.mfaGate(member, false)).toBe('verify');
    mfa = { currentLevel: 'aal2', nextLevel: 'aal2', factors: ['f1'] };
    expect(await identity.mfaGate(member, false)).toBe('ok');
    mfa = { currentLevel: 'aal1', nextLevel: 'aal1', factors: [] };
    expect(await identity.mfaGate(member, false)).toBe('ok');
    expect(await identity.mfaGate(member, true)).toBe('enroll');
    expect(await identity.mfaGate({ ...member, mfaRequired: true }, false)).toBe('enroll');
  });

  it('accepts only six-digit codes the provider accepts, audits failures, and needs a code to disable', async () => {
    const { identity, audit } = setup();
    mfa = { currentLevel: 'aal1', nextLevel: 'aal2', factors: ['f1'] };
    expect(await identity.verifyTotp('12ab56')).toEqual({ ok: false, error: { code: 'invalid-code' } });
    expect(await identity.verifyTotp('000000')).toEqual({ ok: false, error: { code: 'invalid-code' } });
    expect(audit.map((e) => e.action)).toContain('auth.mfa_failed');
    expect(await identity.verifyTotp('123456')).toEqual({ ok: true, value: true });
    expect(await identity.disableTotp('000000')).toEqual({ ok: false, error: { code: 'invalid-code' } });
    expect((await identity.disableTotp('123456')).ok).toBe(true);
    mfa = { currentLevel: 'aal1', nextLevel: 'aal1', factors: [] };
    expect(await identity.verifyTotp('123456')).toEqual({ ok: false, error: { code: 'no-factor' } });
  });
});
