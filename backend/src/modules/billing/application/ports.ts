import type { InvoiceDetail, InvoiceQuery, InvoiceRow, OrderMoney, PaymentRow, TaxRate } from '../domain';
import type { PaymentInput, RefundRequest } from './schemas';

export class RepositoryError extends Error {
  constructor(readonly kind: 'forbidden' | 'not-found' | 'invalid' | 'rule' | 'unavailable', message: string) {
    super(message);
  }
}

export interface BillingRepository {
  listInvoices(query: InvoiceQuery): Promise<{ rows: readonly InvoiceRow[]; total: number }>;
  getInvoice(id: string): Promise<InvoiceDetail | null>;
  createInvoice(orderId: string, dueAt: string | null, notes: string | null): Promise<string>;
  updateDraft(invoiceId: string, dueAt: string | null, notes: string | null): Promise<void>;
  issueInvoice(invoiceId: string, dueAt: string | null): Promise<string>;
  voidInvoice(invoiceId: string, reason: string): Promise<void>;
  orderMoney(orderId: string): Promise<OrderMoney>;
  listPayments(page: number): Promise<{ rows: readonly PaymentRow[]; total: number }>;
  recordPayment(input: PaymentInput): Promise<{ id: string; duplicate: boolean }>;
  requestRefund(input: RefundRequest): Promise<string>;
  decideRefund(refundId: string, approve: boolean, note: string | null): Promise<void>;
  pendingRefunds(): Promise<readonly (PaymentRow & { refundId: string })[]>;
  taxRates(): Promise<readonly TaxRate[]>;
  setDefaultTaxRate(name: string, rateBps: number): Promise<void>;
}
