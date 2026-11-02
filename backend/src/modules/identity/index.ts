/**
 * Public API of the identity module. `createStaffIdentity` is the composition helper: it wires the Supabase adapters,
 * platform rate limits and security records for one request.
 */
import { createSessionClient, hashIdentifier, limit, recordAuditEvent, recordLoginAttempt } from '@platform';
import { createIdentity, type Identity } from './application';
import { SupabaseAuthGateway, SupabaseStaffDirectory } from './infrastructure';

export { moduleDefinition } from './module.config';
export type { StaffMember, StaffRole } from './domain';
export type { Identity, SignInError, ResetError, CallerContext } from './application';
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
