import { err, ok, type Result } from '@backend/kernel';
import { isEmail, normaliseEmail, passwordProblem, type StaffMember } from '../domain';
import type { AttemptLog, AuditSink, AuthGateway, Hasher, RateLimiter, StaffDirectory } from './ports';

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

export interface Identity {
  signIn(input: { email: string; password: string }, caller: CallerContext): Promise<Result<StaffMember, SignInError>>;
  signOut(): Promise<void>;
  requestPasswordReset(input: { email: string }, redirectTo: string, caller: CallerContext): Promise<Result<true, { code: 'rate-limited'; retryAfterSeconds: number } | { code: 'invalid-input' }>>;
  resetPassword(password: string): Promise<Result<true, ResetError>>;
  currentStaff(): Promise<StaffMember | null>;
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
  };
}
