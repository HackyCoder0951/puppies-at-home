import { err, ok, type Result } from '@backend/kernel';
import { isEmail, normaliseEmail } from '../domain';
import type { AuditSink, AuthGateway, StaffAdmin, StaffDirectory, StaffInvitations, StaffRow } from './ports';

export type StaffAdminError = { code: 'forbidden' } | { code: 'invalid'; field: string } | { code: 'exists' } | { code: 'rule'; message: string } | { code: 'unavailable' };

/** Super admin operations on staff accounts. The role is checked here and again by the database. */
export function createStaffAdmin(deps: { auth: AuthGateway; staff: StaffDirectory; admin: StaffAdmin; invitations: StaffInvitations; audit: AuditSink; redirectTo: string; hashEmail: (email: string) => string }) {
  async function actor() {
    const user = await deps.auth.currentUser();
    const member = user ? await deps.staff.find(user.userId) : null;
    return member?.role === 'super_admin' ? member : null;
  }
  const outcome = async (result: 'ok' | 'forbidden' | 'rule', action: string, target: string, rule: string): Promise<Result<true, StaffAdminError>> => {
    if (result === 'ok') {
      const me = await actor();
      await deps.audit.record({ actorId: me?.userId ?? null, action, entity: 'profiles', entityId: target });
      return ok(true);
    }
    return err(result === 'forbidden' ? { code: 'forbidden' } : { code: 'rule', message: rule });
  };

  return {
    async list(): Promise<Result<readonly StaffRow[], StaffAdminError>> {
      return (await actor()) ? ok(await deps.admin.list()) : err({ code: 'forbidden' });
    },
    async invite(input: { email: string; fullName: string; role: string }): Promise<Result<true, StaffAdminError>> {
      const me = await actor();
      if (!me) return err({ code: 'forbidden' });
      const email = normaliseEmail(input.email);
      if (!isEmail(email)) return err({ code: 'invalid', field: 'email' });
      if (input.fullName.trim().length < 2 || input.fullName.length > 120) return err({ code: 'invalid', field: 'fullName' });
      if (input.role !== 'super_admin' && input.role !== 'operator') return err({ code: 'invalid', field: 'role' });
      const result = await deps.invitations.invite({ email, fullName: input.fullName.trim(), role: input.role, redirectTo: deps.redirectTo });
      if (result === 'exists') return err({ code: 'exists' });
      if (result === 'failed') return err({ code: 'unavailable' });
      await deps.audit.record({ actorId: me.userId, action: 'staff.invited', entity: 'profiles', meta: { role: input.role, emailHash: deps.hashEmail(email) } });
      return ok(true);
    },
    async setRole(userId: string, role: string) {
      if (!(await actor())) return err<StaffAdminError>({ code: 'forbidden' });
      if (role !== 'super_admin' && role !== 'operator') return err<StaffAdminError>({ code: 'invalid', field: 'role' });
      return outcome(await deps.admin.setRole(userId, role), 'staff.role_changed', userId, 'You cannot change your own role, and the last super admin must stay.');
    },
    async setDisabled(userId: string, disabled: boolean) {
      if (!(await actor())) return err<StaffAdminError>({ code: 'forbidden' });
      return outcome(await deps.admin.setDisabled(userId, disabled), disabled ? 'staff.disabled' : 'staff.enabled', userId, 'You cannot disable yourself, and the last super admin must stay.');
    },
    async setMfaRequired(userId: string, required: boolean) {
      if (!(await actor())) return err<StaffAdminError>({ code: 'forbidden' });
      return outcome(await deps.admin.setMfaRequired(userId, required), 'staff.mfa_requirement_changed', userId, 'That change is not allowed.');
    },
  };
}

export type StaffAdminService = ReturnType<typeof createStaffAdmin>;
