import { createStaffInbox, type Inbox } from '@backend/modules/inbox';

/** Per-request enquiries and customers for the signed-in staff member (RLS decides what succeeds). */
export function getInbox(): Promise<Inbox> {
  return createStaffInbox();
}
