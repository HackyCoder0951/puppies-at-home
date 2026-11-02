import { createStaffPrivacy, type Privacy } from '@backend/modules/privacy';

/** Per-request privacy tooling for the signed-in staff member (permissions are enforced by the database). */
export function getPrivacy(): Promise<Privacy> {
  return createStaffPrivacy();
}
