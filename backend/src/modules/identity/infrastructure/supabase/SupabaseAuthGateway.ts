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
}
