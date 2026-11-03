/** Public API of the privacy module. `createStaffPrivacy` wires the Supabase adapter for one signed-in request. */
import { createPublicClient, createSessionClient, limit } from '@platform';
import { createPrivacy, createPublicIntake, type Privacy } from './application';
import { SupabaseIntakeStore, SupabasePrivacyRepository } from './infrastructure';

export { moduleDefinition } from './module.config';
export type { Privacy, PrivacyError } from './application';
export type { RequestRow, SubjectInfo, IncidentRow } from './domain';
export { REQUEST_TYPES, REQUEST_STATUSES, CONSENT_PURPOSES, daysUntil, authorityHoursLeft } from './domain';
export { privacyMessage, REQUEST_TYPE_LABEL, REQUEST_STATUS_LABEL, CONSENT_LABEL } from './presentation';

export async function createStaffPrivacy(): Promise<Privacy> {
  return createPrivacy(new SupabasePrivacyRepository(await createSessionClient()));
}

export type { IntakeError } from './application';

/** Public privacy request (no sign-in): validated, honeypot checked, rate limited by RL-PUB-2, stored through the intake function. */
export function submitPrivacyRequest(input: unknown, callerKey: string) {
  return createPublicIntake({ store: new SupabaseIntakeStore(createPublicClient()), limiter: { hit: async (key) => (await limit('RL-PUB-2', key)).retryAfterSeconds } }).submit(input, callerKey);
}
