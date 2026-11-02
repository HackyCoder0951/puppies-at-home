import type { SupabaseClient } from '@supabase/supabase-js';
import type { StaffAdmin, StaffRow } from '../../application';

type Result = 'ok' | 'forbidden' | 'rule';

/** Profile changes through the signed-in super admin's session: RLS (users.manage) and the guard trigger decide. */
export class SupabaseStaffAdmin implements StaffAdmin {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<StaffRow[]> {
    const { data, error } = await this.client.from('profiles').select('user_id, full_name, role, disabled_at, mfa_required').order('full_name');
    if (error) throw new Error(`staff list: ${error.message}`);
    return (data ?? []).map((p) => ({ userId: p.user_id, fullName: p.full_name, role: p.role, disabled: Boolean(p.disabled_at), mfaRequired: p.mfa_required }));
  }

  private async update(userId: string, patch: Record<string, unknown>): Promise<Result> {
    const { data, error } = await this.client.from('profiles').update(patch).eq('user_id', userId).select('user_id');
    if (error) return error.code === '42501' ? (/own role|status|flags/i.test(error.message) ? 'rule' : 'forbidden') : 'rule';
    return data?.length ? 'ok' : 'forbidden';
  }

  setRole(userId: string, role: 'super_admin' | 'operator') {
    return this.update(userId, { role });
  }

  setDisabled(userId: string, disabled: boolean) {
    return this.update(userId, { disabled_at: disabled ? new Date().toISOString() : null });
  }

  setMfaRequired(userId: string, required: boolean) {
    return this.update(userId, { mfa_required: required });
  }
}
