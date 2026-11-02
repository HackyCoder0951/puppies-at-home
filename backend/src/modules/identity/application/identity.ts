import { err, ok, type Result } from '@backend/kernel';
import { isEmail, normaliseEmail, passwordProblem, type StaffMember } from '../domain';
import type { AttemptLog, AuditSink, AuthGateway, Hasher, MfaState, RateLimiter, StaffDirectory } from './ports';

export type SignInError =
  | { code: 'invalid-input' }
  | { code: 'invalid-credentials' }
  | { code: 'locked' }
  | { code: 'rate-limited'; retryAfterSeconds: number }
  | { code: 'unavailable' };

export type ResetError = { code: 'invalid-input' } | { code: 'weak-password'; reason: 'too-short' | 'too-long' } | { code: 'no-session' } | { code: 'unavailable' };

export interface CallerContext {
  readonly ip: string;
  readonly userAgent?: string;
}

export interface IdentityDeps {
  auth: AuthGateway;
  staff: StaffDirectory;
  attempts: AttemptLog;
  audit: AuditSink;
  signInLimiter: RateLimiter;
  resetLimiter: RateLimiter;
  hasher: Hasher;
}

export type { MfaState };

export interface Identity {
  signIn(input: { email: string; password: string }, caller: CallerContext): Promise<Result<StaffMember, SignInError>>;
  signOut(): Promise<void>;
  requestPasswordReset(input: { email: string }, redirectTo: string, caller: CallerContext): Promise<Result<true, { code: 'rate-limited'; retryAfterSeconds: number } | { code: 'invalid-input' }>>;
  resetPassword(password: string): Promise<Result<true, ResetError>>;
  currentStaff(): Promise<StaffMember | null>;
  /** What the portal must do next for this session: nothing, verify a code, or enrol an authenticator. */
  mfaGate(staff: StaffMember, required: boolean): Promise<'ok' | 'verify' | 'enroll'>;
  mfaState(): Promise<MfaState>;
  startTotp(): Promise<Result<{ factorId: string; qrSvg: string; secret: string }, { code: 'unavailable' }>>;
  confirmTotp(factorId: string, code: string): Promise<Result<true, { code: 'invalid-code' }>>;
  verifyTotp(code: string): Promise<Result<true, { code: 'invalid-code' | 'no-factor' }>>;
  disableTotp(code: string): Promise<Result<true, { code: 'invalid-code' | 'no-factor' }>>;
}

export function createIdentity(deps: IdentityDeps): Identity {
  const { auth, staff, attempts, audit, hasher } = deps;

  return {
    async signIn(input, caller) {
      const email = normaliseEmail(input.email ?? '');
      const password = input.password ?? '';
      if (!isEmail(email) || !password || password.length > 128) return err({ code: 'invalid-input' });
      const emailHash = hasher.hash(email);
      const ipHash = hasher.hash(caller.ip);

      const wait = Math.max(await deps.signInLimiter.hit(`${caller.ip}|${email}`), await deps.signInLimiter.hit(`email|${email}`));
      if (wait > 0) return err({ code: 'rate-limited', retryAfterSeconds: wait });

      const result = await auth.signInWithPassword(email, password);
      if (!result.ok) {
        if (result.reason === 'unavailable') return err({ code: 'unavailable' });
        const locked = await attempts.record(emailHash, ipHash, false);
        await audit.record({ actorId: null, action: 'auth.sign_in_failed', entity: 'auth', entityId: emailHash, meta: { reason: result.reason }, ipHash, userAgent: caller.userAgent });
        return err({ code: locked ? 'locked' : 'invalid-credentials' });
      }

      const member = await staff.find(result.user.userId);
      if (!member) {
        // A valid login without an active staff profile is not a staff account: end the session and say nothing more.
        await auth.signOut();
        await attempts.record(emailHash, ipHash, false);
        await audit.record({ actorId: result.user.userId, action: 'auth.sign_in_denied', entity: 'auth', entityId: result.user.userId, meta: { reason: 'not-staff-or-disabled' }, ipHash, userAgent: caller.userAgent });
        return err({ code: 'invalid-credentials' });
      }

      await attempts.record(emailHash, ipHash, true);
      await audit.record({ actorId: member.userId, action: 'auth.sign_in', entity: 'auth', entityId: member.userId, ipHash, userAgent: caller.userAgent });
      return ok(member);
    },

    async signOut() {
      const user = await auth.currentUser();
      await auth.signOut();
      if (user) await audit.record({ actorId: user.userId, action: 'auth.sign_out', entity: 'auth', entityId: user.userId });
    },

    async requestPasswordReset(input, redirectTo, caller) {
      const email = normaliseEmail(input.email ?? '');
      if (!isEmail(email)) return err({ code: 'invalid-input' });
      const wait = await deps.resetLimiter.hit(caller.ip);
      if (wait > 0) return err({ code: 'rate-limited', retryAfterSeconds: wait });
      // Same outcome whether or not the address exists (no account enumeration).
      await auth.sendPasswordReset(email, redirectTo).catch(() => undefined);
      await audit.record({ actorId: null, action: 'auth.password_reset_requested', entity: 'auth', entityId: hasher.hash(email), ipHash: hasher.hash(caller.ip), userAgent: caller.userAgent });
      return ok(true);
    },

    async resetPassword(password) {
      const problem = passwordProblem(password ?? '');
      if (problem) return err({ code: 'weak-password', reason: problem });
      const user = await auth.currentUser();
      if (!user) return err({ code: 'no-session' });
      const result = await auth.updatePassword(password);
      if (!result.ok) return err(result.reason === 'weak' ? { code: 'weak-password', reason: 'too-short' } : result.reason === 'no-session' ? { code: 'no-session' } : { code: 'unavailable' });
      await audit.record({ actorId: user.userId, action: 'auth.password_changed', entity: 'auth', entityId: user.userId });
      return ok(true);
    },

    async currentStaff() {
      const user = await auth.currentUser();
      return user ? staff.find(user.userId) : null;
    },

    async mfaGate(member, required) {
      const state = await auth.mfaState();
      if (state.factors.length > 0) return state.currentLevel === 'aal2' ? 'ok' : 'verify';
      return required || member.mfaRequired ? 'enroll' : 'ok';
    },

    mfaState: () => auth.mfaState(),

    async startTotp() {
      const started = await auth.enrollTotp();
      return started ? ok(started) : err({ code: 'unavailable' as const });
    },

    async confirmTotp(factorId, code) {
      if (!/^\d{6}$/.test(code.trim())) return err({ code: 'invalid-code' as const });
      const accepted = await auth.verifyTotp(factorId, code.trim());
      const user = await auth.currentUser();
      if (accepted && user) await audit.record({ actorId: user.userId, action: 'auth.mfa_enrolled', entity: 'auth', entityId: user.userId });
      return accepted ? ok(true as const) : err({ code: 'invalid-code' as const });
    },

    async verifyTotp(code) {
      const [factor] = (await auth.mfaState()).factors;
      if (!factor) return err({ code: 'no-factor' as const });
      if (!/^\d{6}$/.test(code.trim())) return err({ code: 'invalid-code' as const });
      const user = await auth.currentUser();
      if (user && (await deps.signInLimiter.hit(`mfa|${user.userId}`)) > 0) return err({ code: 'invalid-code' as const });
      const accepted = await auth.verifyTotp(factor, code.trim());
      if (!accepted && user) await audit.record({ actorId: user.userId, action: 'auth.mfa_failed', entity: 'auth', entityId: user.userId });
      return accepted ? ok(true as const) : err({ code: 'invalid-code' as const });
    },

    /** Turning the second factor off needs a valid code, so a stolen session cannot silently remove it. */
    async disableTotp(code) {
      const [factor] = (await auth.mfaState()).factors;
      if (!factor) return err({ code: 'no-factor' as const });
      if (!(await auth.verifyTotp(factor, code.trim()))) return err({ code: 'invalid-code' as const });
      const removed = await auth.removeFactor(factor);
      const user = await auth.currentUser();
      if (removed && user) await audit.record({ actorId: user.userId, action: 'auth.mfa_disabled', entity: 'auth', entityId: user.userId });
      return removed ? ok(true as const) : err({ code: 'invalid-code' as const });
    },
  };
}
