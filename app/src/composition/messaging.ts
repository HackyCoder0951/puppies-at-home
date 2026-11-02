import { createStaffMessagingFor, type StaffMessaging } from '@backend/modules/messaging';

/** Per-request notifications, message log, templates and rules for the signed-in staff member. */
export function getMessaging(): Promise<StaffMessaging> {
  return createStaffMessagingFor();
}
