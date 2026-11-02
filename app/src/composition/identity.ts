import { createStaffIdentity, type Identity } from '@backend/modules/identity';

/** Per-request staff identity (session cookies); the admin pages and actions call this. */
export function getIdentity(): Promise<Identity> {
  return createStaffIdentity();
}
