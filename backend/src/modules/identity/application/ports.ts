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
