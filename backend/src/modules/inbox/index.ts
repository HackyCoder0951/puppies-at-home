/** Public API of the inbox module. `createStaffInbox` wires the Supabase adapter for one signed-in request. */
import { createSessionClient } from '@platform';
import { createInbox, type Inbox } from './application';
import { SupabaseInboxRepository } from './infrastructure';

export { moduleDefinition } from './module.config';
export type { Inbox, InboxError } from './application';
export type { EnquiryRow, EnquiryDetail, EnquiryStatus, CustomerRow, CustomerDetail, StaffOption, NoteRow, EnquiryQuery } from './domain';
export { ENQUIRY_STATUSES, PAGE_SIZE, whatsappLinkFor } from './domain';
export { inboxMessage, STATUS_LABEL, SOURCE_LABEL } from './presentation';

export async function createStaffInbox(): Promise<Inbox> {
  return createInbox(new SupabaseInboxRepository(await createSessionClient()));
}
