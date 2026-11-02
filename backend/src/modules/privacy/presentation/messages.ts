import type { PrivacyError } from '../application';

export const REQUEST_TYPE_LABEL: Record<string, string> = {
  access: 'Access (copy of data)', rectification: 'Correction', erasure: 'Erasure', restriction: 'Restriction', portability: 'Portability', objection: 'Objection', withdrawal: 'Withdraw consent', grievance: 'Complaint',
};
export const REQUEST_STATUS_LABEL: Record<string, string> = { received: 'Received', verifying: 'Verifying identity', in_progress: 'In progress', completed: 'Completed', rejected: 'Rejected', extended: 'Extended (complex)' };
export const CONSENT_LABEL: Record<string, string> = { enquiry_reply: 'Reply to my enquiry', marketing_email: 'Marketing email', whatsapp_updates: 'WhatsApp updates', photo_publication: 'Photo publication' };

const FIELD: Record<string, string> = { requester: 'Name', contact: 'Contact', type: 'Request type', summary: 'Summary (at least 5 characters)', detectedAt: 'When it was detected', awareAt: 'When you became aware', riskLevel: 'Risk', purpose: 'Consent purpose', status: 'Status' };

export function privacyMessage(error: PrivacyError): string {
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
