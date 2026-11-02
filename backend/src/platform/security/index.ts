import 'server-only';
import { createServiceClient } from '../supabase/service';

/**
 * Security records written with the service role because the actor may be anonymous (failed sign-ins) and the
 * functions are not callable by browser roles. The only way application code reaches the service client.
 */
export async function recordLoginAttempt(emailHash: string, ipHash: string, success: boolean): Promise<boolean> {
  const { data, error } = await createServiceClient().rpc('record_login_attempt', { p_email_hash: emailHash, p_ip_hash: ipHash, p_success: success });
  if (error) throw new Error(`login attempt: ${error.message}`);
  return Boolean(data);
}

export interface AuditEventRecord {
  readonly actorId: string | null;
  readonly action: string;
  readonly entity: string;
  readonly entityId?: string;
  readonly meta?: Record<string, unknown>;
  readonly ipHash?: string;
  readonly userAgent?: string;
}

export async function recordAuditEvent(event: AuditEventRecord): Promise<void> {
  const { error } = await createServiceClient().rpc('record_audit_event', {
    p_actor: event.actorId,
    p_action: event.action,
    p_entity: event.entity,
    p_entity_id: event.entityId ?? null,
    p_meta: event.meta ?? null,
    p_ip_hash: event.ipHash ?? null,
    p_user_agent: event.userAgent ?? null,
  });
  if (error) throw new Error(`audit: ${error.message}`);
}

export { verifyCronRequest } from './cron';
export { evaluateSession, parseStamp, SEEN_COOKIE, START_COOKIE, type SessionVerdict } from './session';

/**
 * Invites a staff member: Supabase emails a one-time link (the user then sets a password), and the profile row is created
 * with the chosen role. Only called after the application layer has checked the caller is a super admin.
 */
export async function inviteStaffUser(input: { email: string; fullName: string; role: 'super_admin' | 'operator'; redirectTo: string }): Promise<'ok' | 'exists' | 'failed'> {
  const db = createServiceClient();
  const { data, error } = await db.auth.admin.inviteUserByEmail(input.email, { redirectTo: input.redirectTo });
  if (error || !data.user) return /already|registered|exists/i.test(error?.message ?? '') ? 'exists' : 'failed';
  const { error: profileError } = await db.from('profiles').insert({ user_id: data.user.id, full_name: input.fullName, role: input.role });
  if (profileError) {
    await db.auth.admin.deleteUser(data.user.id);
    return 'failed';
  }
  return 'ok';
}
