import type { StaffMember } from '../domain';

export interface AuthUser {
  readonly userId: string;
  readonly email: string;
}

/** Identity provider (Supabase Auth). */
export interface AuthGateway {
  signInWithPassword(email: string, password: string): Promise<{ ok: true; user: AuthUser } | { ok: false; reason: 'invalid' | 'unverified' | 'unavailable' }>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string, redirectTo: string): Promise<void>;
  updatePassword(password: string): Promise<{ ok: true } | { ok: false; reason: 'no-session' | 'weak' | 'unavailable' }>;
  currentUser(): Promise<AuthUser | null>;
  mfaState(): Promise<MfaState>;
  enrollTotp(): Promise<{ factorId: string; qrSvg: string; secret: string } | null>;
  /** Challenges and verifies a code for the factor; true when accepted (the session becomes aal2). */
  verifyTotp(factorId: string, code: string): Promise<boolean>;
  removeFactor(factorId: string): Promise<boolean>;
}

export interface MfaState {
  readonly currentLevel: 'aal1' | 'aal2' | null;
  readonly nextLevel: 'aal1' | 'aal2' | null;
  /** Verified TOTP factor ids. */
  readonly factors: readonly string[];
}

/** Staff profiles (role, disabled flag). */
export interface StaffDirectory {
  find(userId: string): Promise<StaffMember | null>;
}

/** Sign-in attempts per hashed email and IP; returns true when the account is now locked. */
export interface AttemptLog {
  record(emailHash: string, ipHash: string, success: boolean): Promise<boolean>;
}

export interface AuditEvent {
  readonly actorId: string | null;
  readonly action: string;
  readonly entity: string;
  readonly entityId?: string;
  readonly meta?: Record<string, unknown>;
  readonly ipHash?: string;
  readonly userAgent?: string;
}

export interface AuditSink {
  record(event: AuditEvent): Promise<void>;
}

/** Returns 0 when allowed, otherwise the seconds to wait. */
export interface RateLimiter {
  hit(key: string): Promise<number>;
}

export interface Hasher {
  hash(value: string): string;
}

export interface StaffRow { readonly userId: string; readonly fullName: string; readonly role: 'super_admin' | 'operator'; readonly disabled: boolean; readonly mfaRequired: boolean }

/** Staff administration (super admins). Role and status changes are checked again by database triggers. */
export interface StaffAdmin {
  list(): Promise<readonly StaffRow[]>;
  setRole(userId: string, role: 'super_admin' | 'operator'): Promise<'ok' | 'forbidden' | 'rule'>;
  setDisabled(userId: string, disabled: boolean): Promise<'ok' | 'forbidden' | 'rule'>;
  setMfaRequired(userId: string, required: boolean): Promise<'ok' | 'forbidden' | 'rule'>;
}

export interface StaffInvitations { invite(input: { email: string; fullName: string; role: 'super_admin' | 'operator'; redirectTo: string }): Promise<'ok' | 'exists' | 'failed'> }
