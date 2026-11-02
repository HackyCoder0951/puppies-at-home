import type { BillingError } from '../application';
import type { InvoiceStatus, PaymentMethod, PaymentStatus, RefundStatus } from '../domain';

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = { draft: 'Draft', issued: 'Issued', partially_paid: 'Partly paid', paid: 'Paid', overdue: 'Overdue', void: 'Void' };
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = { cash: 'Cash', bank_transfer: 'Bank transfer', card_machine: 'Card machine', card: 'Card', link: 'Payment link', other: 'Other' };
export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = { pending: 'Pending', succeeded: 'Received', failed: 'Failed', partially_refunded: 'Partly refunded', refunded: 'Refunded' };
export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = { requested: 'Waiting for approval', approved: 'Approved', processed: 'Refunded', failed: 'Failed', rejected: 'Rejected' };

const FIELD: Record<string, string> = { reference: 'Payment reference (at least 6 characters)', amountMinor: 'Amount', method: 'Method', reason: 'Reason', dueAt: 'Due date', name: 'Name', percent: 'Rate (0 to 100)' };

export function billingMessage(error: BillingError): string {
  switch (error.code) {
    case 'invalid':
      return error.field && FIELD[error.field] ? `Check this field: ${FIELD[error.field]}.` : 'Some fields are not valid.';
    case 'rule':
      return error.message;
    case 'forbidden':
      return 'Your role is not allowed to do that.';
    case 'not-found':
      return 'That record no longer exists.';
    case 'unavailable':
      return 'Could not complete that right now. Try again shortly.';
  }
}
