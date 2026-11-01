export type EnquirySource = 'contact' | 'puppy';

/** A validated enquiry as the business sees it. Contact details are personal data (see docs 06 section 6). */
export interface Enquiry {
  readonly id: string;
  readonly source: EnquirySource;
  readonly name: string;
  readonly phoneE164: string;
  readonly email?: string;
  readonly area?: string;
  readonly puppy?: string;
  readonly message?: string;
  readonly receivedAt: Date;
  readonly consent: ConsentRecord;
}

/** Evidence of what the person agreed to: unticked by default, versioned text. */
export interface ConsentRecord {
  readonly textVersion: string;
  readonly marketing: boolean;
  readonly whatsappUpdates: boolean;
  readonly adultStatement: true;
  readonly sourcePage: string;
}

/** Normalises a phone number to E.164, or returns undefined when it cannot be one. */
export function toE164(raw: string): string | undefined {
  const compact = raw.replace(/[\s().-]/g, '');
  const withPlus = compact.startsWith('00') ? `+${compact.slice(2)}` : compact;
  return /^\+[1-9]\d{7,14}$/.test(withPlus) ? withPlus : undefined;
}
