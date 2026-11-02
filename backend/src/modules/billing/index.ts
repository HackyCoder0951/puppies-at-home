/** Public API of the billing module. `createStaffBilling` wires the Supabase adapter for one signed-in request. */
import { createSessionClient } from '@platform';
import { createBilling, type Billing } from './application';
import { SupabaseBillingRepository } from './infrastructure';

export { moduleDefinition } from './module.config';
export type { Billing, BillingError } from './application';
export type { InvoiceRow, InvoiceDetail, InvoiceLineRow, PaymentRow, RefundRow, OrderMoney, TaxRate, InvoiceStatus, PaymentMethod } from './domain';
export { INVOICE_STATUSES, PAYMENT_METHODS, PAGE_SIZE, formatMoney, formatRate } from './domain';
export { billingMessage, INVOICE_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, REFUND_STATUS_LABEL } from './presentation';

export async function createStaffBilling(): Promise<Billing> {
  return createBilling(new SupabaseBillingRepository(await createSessionClient()));
}
