import { createStaffBilling, type Billing } from '@backend/modules/billing';

/** Per-request invoices, payments and refunds for the signed-in staff member (RLS and database rules decide). */
export function getBilling(): Promise<Billing> {
  return createStaffBilling();
}
