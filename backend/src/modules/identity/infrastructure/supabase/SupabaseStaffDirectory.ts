import type { SupabaseClient } from '@supabase/supabase-js';
import type { StaffMember } from '../../domain';
import type { StaffDirectory } from '../../application';

/** Reads the signed-in user's own profile through RLS (profiles_select_self); disabled accounts are not staff. */
export class SupabaseStaffDirectory implements StaffDirectory {
  constructor(private readonly client: SupabaseClient) {}

  async find(userId: string): Promise<StaffMember | null> {
    const { data: auth } = await this.client.auth.getUser();
    const { data, error } = await this.client.from('profiles').select('user_id, full_name, role, mfa_required, disabled_at').eq('user_id', userId).maybeSingle();
    if (error || !data || data.disabled_at) return null;
    return { userId: data.user_id, email: auth.user?.email ?? '', fullName: data.full_name, role: data.role, mfaRequired: data.mfa_required };
  }
}
