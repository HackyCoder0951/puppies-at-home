import type { EnquiryStatus } from '@backend/modules/inbox';
import type { Tone } from '@shared/ui/admin';

export const ENQUIRY_TONE: Record<EnquiryStatus, Tone> = { new: 'accent', contacted: 'info', qualified: 'warning', converted: 'success', closed: 'neutral', spam: 'danger' };
