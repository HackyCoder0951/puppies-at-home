import type { ReportingError } from '../application';

export function reportingMessage(error: ReportingError): string {
  switch (error.code) {
    case 'invalid':
      return error.field === 'range' ? 'Choose a start and end date.' : 'Unknown export.';
    case 'forbidden':
      return 'Your role is not allowed to export this.';
    case 'rule':
      return error.message;
    case 'rate-limited':
      return `Too many exports. Try again in ${Math.max(1, Math.ceil(error.retryAfterSeconds / 60))} minute(s).`;
    case 'unavailable':
      return 'Could not complete that right now. Try again shortly.';
  }
}
