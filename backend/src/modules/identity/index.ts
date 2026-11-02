/**
 * Public API of the identity module. `createStaffIdentity` is the composition helper: it wires the Supabase adapters,
 * platform rate limits and security records for one request.
 */
import { createSessionClient, hashIdentifier, inviteStaffUser, limit, recordAuditEvent, recordLoginAttempt } from '@platform';
import { createIdentity, createStaffAdmin, type Identity, type StaffAdminService } from './application';
import { SupabaseAuthGateway, SupabaseStaffAdmin, SupabaseStaffDirectory } from './infrastructure';

export { moduleDefinition } from './module.config';
export type { StaffMember, StaffRole } from './domain';
export type { Identity, SignInError, ResetError, CallerContext, MfaState, StaffAdminService, StaffAdminError, StaffRow } from './application';
export { signInMessage, resetMessage, RESET_REQUESTED_MESSAGE } from './presentation';

export async function createStaffIdentity(): Promise<Identity> {
  const client = await createSessionClient();
  return createIdentity({
    auth: new SupabaseAuthGateway(client),
    staff: new SupabaseStaffDirectory(client),
    attempts: { record: recordLoginAttempt },
    audit: { record: recordAuditEvent },
    signInLimiter: { hit: async (key) => (await limit('RL-AUTH-1', key)).retryAfterSeconds },
    resetLimiter: { hit: async (key) => (await limit('RL-AUTH-3', key)).retryAfterSeconds },
    hasher: { hash: hashIdentifier },
  });
}

/** Super admin staff administration for one signed-in request. `redirectTo` is where the invitation email sends people to set a password. */
export async function createStaffAdministration(redirectTo: string): Promise<StaffAdminService> {
  const client = await createSessionClient();
  return createStaffAdmin({
    auth: new SupabaseAuthGateway(client), staff: new SupabaseStaffDirectory(client), admin: new SupabaseStaffAdmin(client),
    invitations: { invite: inviteStaffUser }, audit: { record: recordAuditEvent }, redirectTo, hashEmail: hashIdentifier,
  });
}
