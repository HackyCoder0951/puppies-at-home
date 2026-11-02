import { createStaffAdministration, createStaffIdentity, type Identity, type StaffAdminService } from '@backend/modules/identity';
import { getEnv } from '@shared/config';
import { adminPaths } from '@nav';

/** Per-request staff identity (session cookies); the admin pages and actions call this. */
export function getIdentity(): Promise<Identity> {
  return createStaffIdentity();
}

/** Super admin staff administration; invitations send people to set their password through the auth callback. */
export function getStaffAdmin(): Promise<StaffAdminService> {
  const url = new URL(adminPaths.authCallback(), getEnv().NEXT_PUBLIC_SITE_URL);
  url.searchParams.set('next', adminPaths.resetPassword());
  return createStaffAdministration(url.toString());
}
