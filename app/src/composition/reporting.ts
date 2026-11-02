import { createStaffReporting, type Reporting } from '@backend/modules/reporting';

/** Per-request dashboard figures and exports for the signed-in staff member. */
export function getReporting(): Promise<Reporting> {
  return createStaffReporting();
}
