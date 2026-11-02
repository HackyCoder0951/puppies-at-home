import { createStaffCommerce, type Commerce } from '@backend/modules/commerce';

/** Per-request orders and deliveries for the signed-in staff member (RLS and the database state machines decide). */
export function getCommerce(): Promise<Commerce> {
  return createStaffCommerce();
}
