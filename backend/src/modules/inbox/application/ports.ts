import type { CustomerDetail, CustomerRow, EnquiryDetail, EnquiryQuery, EnquiryRow, EnquiryStatus, StaffOption } from '../domain';
import type { CustomerInput } from './schemas';

export class RepositoryError extends Error {
  constructor(readonly kind: 'forbidden' | 'not-found' | 'unavailable', message: string) {
    super(message);
  }
}

export interface InboxRepository {
  listEnquiries(query: EnquiryQuery): Promise<{ rows: readonly EnquiryRow[]; total: number }>;
  getEnquiry(id: string): Promise<EnquiryDetail | null>;
  setStatus(id: string, status: EnquiryStatus): Promise<void>;
  assign(id: string, userId: string | null): Promise<void>;
  addNote(enquiryId: string, body: string): Promise<void>;
  listStaff(): Promise<readonly StaffOption[]>;
  listCustomers(search: string | undefined, page: number): Promise<{ rows: readonly CustomerRow[]; total: number }>;
  getCustomer(id: string): Promise<CustomerDetail | null>;
  updateCustomer(id: string, input: CustomerInput): Promise<void>;
}
