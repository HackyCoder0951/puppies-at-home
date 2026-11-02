import type { StaffMessagingError } from '../application';

export const MESSAGE_STATUS_LABEL: Record<string, string> = { queued: 'Queued', sent: 'Sent', delivered: 'Delivered', read: 'Read', failed: 'Failed', handed_off: 'Opened in WhatsApp', skipped: 'Skipped' };

const FIELD: Record<string, string> = { body: 'Message body (1 to 4,000 characters)', subject: 'Subject (up to 200 characters)', channel: 'Channel' };

export function messagingMessage(error: StaffMessagingError): string {
  switch (error.code) {
    case 'invalid':
      return error.field && FIELD[error.field] ? `Check this field: ${FIELD[error.field]}.` : 'Some fields are not valid.';
    case 'rule':
      return error.message;
    case 'forbidden':
      return 'Your role is not allowed to do that.';
    case 'unavailable':
      return 'Could not complete that right now. Try again shortly.';
  }
}
