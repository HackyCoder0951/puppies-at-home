import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthGateway, AuthUser } from '../../application';

/** Supabase Auth over the per-request session client (cookies). */
export class SupabaseAuthGateway implements AuthGateway {
  constructor(private readonly client: SupabaseClient) {}

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      if (error?.code === 'email_not_confirmed') return { ok: false as const, reason: 'unverified' as const };
      if (error && (error.status ?? 0) >= 500) return { ok: false as const, reason: 'unavailable' as const };
      return { ok: false as const, reason: 'invalid' as const };
    }
    return { ok: true as const, user: { userId: data.user.id, email: data.user.email ?? email } };
  }

  async signOut() {
    await this.client.auth.signOut();
  }

  async sendPasswordReset(email: string, redirectTo: string) {
    await this.client.auth.resetPasswordForEmail(email, { redirectTo });
  }

  async updatePassword(password: string) {
    const { error } = await this.client.auth.updateUser({ password });
    if (!error) return { ok: true as const };
    if (error.code === 'weak_password') return { ok: false as const, reason: 'weak' as const };
    if (error.status === 401 || error.code === 'session_not_found') return { ok: false as const, reason: 'no-session' as const };
    return { ok: false as const, reason: 'unavailable' as const };
  }

  async currentUser(): Promise<AuthUser | null> {
    const { data } = await this.client.auth.getUser();
    return data.user ? { userId: data.user.id, email: data.user.email ?? '' } : null;
  }

  async mfaState() {
    const [{ data: level }, { data: factors }] = await Promise.all([this.client.auth.mfa.getAuthenticatorAssuranceLevel(), this.client.auth.mfa.listFactors()]);
    return {
      currentLevel: (level?.currentLevel as 'aal1' | 'aal2' | null | undefined) ?? null,
      nextLevel: (level?.nextLevel as 'aal1' | 'aal2' | null | undefined) ?? null,
      factors: (factors?.totp ?? []).filter((f) => f.status === 'verified').map((f) => f.id),
    };
  }

  async enrollTotp() {
    // Drop abandoned, never-verified factors first so a retry does not collide with them.
    const { data: existing } = await this.client.auth.mfa.listFactors();
    for (const f of existing?.all ?? []) if (f.factor_type === 'totp' && f.status === 'unverified') await this.client.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await this.client.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}` });
    if (error || !data) return null;
    return { factorId: data.id, qrSvg: data.totp.qr_code, secret: data.totp.secret };
  }

  async verifyTotp(factorId: string, code: string) {
    const { data: challenge, error } = await this.client.auth.mfa.challenge({ factorId });
    if (error || !challenge) return false;
    const { error: verifyError } = await this.client.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    return !verifyError;
  }

  async removeFactor(factorId: string) {
    const { error } = await this.client.auth.mfa.unenroll({ factorId });
    return !error;
  }
}
