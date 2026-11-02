export const ENQUIRY_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'closed', 'spam'] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export type EnquirySource = 'contact_letter' | 'puppy_enquiry' | 'whatsapp' | 'manual';

export interface EnquiryRow {
  readonly id: string;
  readonly name: string;
  readonly phone: string | null;
  readonly email: string | null;
  readonly status: EnquiryStatus;
  readonly source: EnquirySource;
  readonly puppyLabel: string | null;
  readonly assignedTo: string | null;
  readonly createdAt: string;
}

export interface NoteRow {
  readonly id: string;
  readonly body: string;
  readonly authorName: string;
  readonly createdAt: string;
}

export interface EnquiryDetail extends EnquiryRow {
  readonly area: string | null;
  readonly message: string | null;
  readonly sourcePage: string | null;
  readonly customerId: string | null;
  readonly puppyId: string | null;
  readonly notes: readonly NoteRow[];
}

export interface StaffOption {
  readonly userId: string;
  readonly fullName: string;
  readonly role: 'super_admin' | 'operator';
}

export interface CustomerRow {
  readonly id: string;
  readonly fullName: string;
  readonly phone: string | null;
  readonly email: string | null;
  readonly area: string | null;
  readonly createdAt: string;
}

export interface CustomerDetail extends CustomerRow {
  readonly notes: string | null;
  readonly tags: readonly string[];
  readonly whatsappOptInAt: string | null;
  readonly whatsappOptedOutAt: string | null;
  readonly enquiries: readonly EnquiryRow[];
}

export interface EnquiryQuery {
  readonly status?: EnquiryStatus;
  readonly assignedTo?: string;
  readonly search?: string;
  readonly page: number;
}

export const PAGE_SIZE = 25;
