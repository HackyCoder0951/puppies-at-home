import type { EnquiryStatus } from '../domain';
import type { InboxError } from '../application';

export const STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified', converted: 'Converted to order', closed: 'Closed', spam: 'Spam',
};

export const SOURCE_LABEL = { contact_letter: 'Contact form', puppy_enquiry: 'Puppy page', whatsapp: 'WhatsApp', manual: 'Added by staff' } as const;

const FIELD: Record<string, string> = { body: 'Note', fullName: 'Name', email: 'Email', status: 'Status' };

export function inboxMessage(error: InboxError): string {
  switch (error.code) {
    case 'invalid':
      return error.field && FIELD[error.field] ? `Check this field: ${FIELD[error.field]}.` : 'Some fields are not valid.';
    case 'forbidden':
      return 'Your role is not allowed to do that.';
    case 'not-found':
      return 'That record no longer exists.';
    case 'unavailable':
      return 'Could not complete that right now. Try again shortly.';
  }
}
