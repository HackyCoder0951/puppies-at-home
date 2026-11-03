export const INVOICE_STATUSES = ['draft', 'issued', 'partially_paid', 'paid', 'overdue', 'void'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card_machine', 'card', 'link', 'other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'partially_refunded' | 'refunded';
export type RefundStatus = 'requested' | 'approved' | 'processed' | 'failed' | 'rejected';

export interface InvoiceRow {
  readonly id: string;
  readonly number: string | null;
  readonly orderId: string;
  readonly orderNumber: string;
  readonly customerName: string;
  readonly status: InvoiceStatus;
  readonly totalMinor: number;
  readonly paidMinor: number;
  readonly currency: string;
  readonly dueAt: string | null;
  readonly issuedAt: string | null;
}

export interface InvoiceLineRow { readonly description: string; readonly quantity: number; readonly unitMinor: number; readonly taxRateBps: number; readonly taxMinor: number }

export interface RefundRow {
  readonly id: string;
  readonly paymentId: string;
  readonly amountMinor: number;
  readonly reason: string;
  readonly status: RefundStatus;
  readonly requestedByName: string;
  readonly decidedByName: string | null;
  readonly decisionNote: string | null;
  readonly createdAt: string;
}

export interface PaymentRow {
  readonly id: string;
  readonly orderId: string;
  readonly orderNumber: string;
  readonly invoiceId: string | null;
  readonly invoiceNumber: string | null;
  readonly gateway: string;
  readonly reference: string;
  readonly method: PaymentMethod;
  readonly amountMinor: number;
  readonly currency: string;
  readonly status: PaymentStatus;
  readonly paidAt: string;
  readonly note: string | null;
  readonly recordedByName: string | null;
  readonly refunds: readonly RefundRow[];
}

export interface InvoiceDetail extends InvoiceRow {
  readonly subtotalMinor: number;
  readonly taxMinor: number;
  readonly notes: string | null;
  readonly voidReason: string | null;
  readonly customerId: string;
  readonly lines: readonly InvoiceLineRow[];
  readonly payments: readonly PaymentRow[];
}

export interface OrderMoney {
  readonly invoices: readonly InvoiceRow[];
  readonly payments: readonly PaymentRow[];
}

export interface TaxRate { readonly id: string; readonly name: string; readonly rateBps: number; readonly isDefault: boolean }

export interface InvoiceQuery { readonly status?: InvoiceStatus; readonly page: number }
export const PAGE_SIZE = 25;

/** Everything printed on an invoice document. Amounts are the snapshot stored on the invoice, never recomputed. */
export interface InvoiceDocument {
  readonly number: string;
  readonly status: InvoiceStatus;
  readonly issuedAt: string | null;
  readonly dueAt: string | null;
  readonly currency: string;
  readonly orderNumber: string;
  readonly customer: { readonly name: string; readonly email: string | null; readonly phone: string | null };
  readonly lines: readonly InvoiceLineRow[];
  readonly subtotalMinor: number;
  readonly taxMinor: number;
  readonly totalMinor: number;
  readonly paidMinor: number;
  readonly notes: string | null;
  readonly business: { readonly name: string; readonly address: string; readonly email: string; readonly phone: string };
}
