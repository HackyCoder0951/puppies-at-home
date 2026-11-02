/** Public API of the privacy module. `createStaffPrivacy` wires the Supabase adapter for one signed-in request. */
import { createSessionClient } from '@platform';
import { createPrivacy, type Privacy } from './application';
import { SupabasePrivacyRepository } from './infrastructure';

export { moduleDefinition } from './module.config';
export type { Privacy, PrivacyError } from './application';
export type { RequestRow, SubjectInfo, IncidentRow } from './domain';
export { REQUEST_TYPES, REQUEST_STATUSES, CONSENT_PURPOSES, daysUntil, authorityHoursLeft } from './domain';
export { privacyMessage, REQUEST_TYPE_LABEL, REQUEST_STATUS_LABEL, CONSENT_LABEL } from './presentation';

export async function createStaffPrivacy(): Promise<Privacy> {
  return createPrivacy(new SupabasePrivacyRepository(await createSessionClient()));
}
