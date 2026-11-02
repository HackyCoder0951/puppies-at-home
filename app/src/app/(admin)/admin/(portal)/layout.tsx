import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getIdentity, getMessaging, getReporting } from '@composition';
import { getEnv } from '@shared/config';
import { adminPaths } from '@nav';
import { signOutAction } from '../actions';
import { navGroups, type NavCounts } from './shell/nav';
import { Rail } from './shell/Rail';
import { Shortcuts } from './shell/Shortcuts';
import { Toaster } from './shell/Toaster';
import { Topbar } from './shell/Topbar';

/** Second gate behind `proxy.ts`, plus the app shell: rail with live counts, top bar, environment badge, colour mode. */
export default async function PortalLayout({ children }: { children: ReactNode }) {
  const identity = await getIdentity();
  const staff = await identity.currentStaff();
  if (!staff) redirect(adminPaths.login());
  // Second factor: a code when one is set up, set-up when the role requires it (operators when MFA_REQUIRED_FOR_OPERATORS is on).
  const gate = await identity.mfaGate(staff, staff.role === 'operator' && getEnv().MFA_REQUIRED_FOR_OPERATORS);
  if (gate === 'verify') redirect(adminPaths.verify());
  if (gate === 'enroll') redirect(adminPaths.security());

  const [unread, stats] = await Promise.all([getMessaging().then((m) => m.unreadCount()), getReporting().then((r) => r.stats())]);
  const s = stats.ok ? stats.value : null;
  const counts: NavCounts = {
    unread: unread.ok ? unread.value : 0, newEnquiries: s?.enquiries.new ?? 0, openOrders: s?.orders.open ?? 0, delayedDeliveries: s?.deliveries.delayed ?? 0,
    overdueInvoices: s?.money.overdueInvoices ?? 0, refundsWaiting: s?.money.refundsWaiting ?? 0, outboxFailed: s?.system.outboxFailed ?? 0,
  };
  const groups = navGroups(counts, staff.role === 'super_admin');
  const palette = [
    ...groups.flatMap((g) => g.items.map((i) => ({ label: i.label, href: i.href, hint: g.heading }))),
    { label: 'New puppy', href: adminPaths.newPuppy(), hint: 'Create' },
    { label: 'Orders board', href: adminPaths.orders(), hint: 'Work' },
    { label: 'Orders table', href: `${adminPaths.orders()}?view=table`, hint: 'Work' },
  ];
  const saved = (await cookies()).get('adm-theme')?.value;
  const mode = saved === 'light' || saved === 'dark' ? saved : 'system';

  return (
    <div className="adm-shell">
      <Rail groups={groups} />
      <div className="adm-main">
        <Topbar env={getEnv().APP_ENV} mode={mode} unread={counts.unread} staffName={`${staff.fullName} (${staff.role === 'super_admin' ? 'Super admin' : 'Operator'})`} palette={palette}>
          <form action={signOutAction}><button type="submit" className="adm-btn adm-btn-secondary adm-btn-small">Sign out</button></form>
        </Topbar>
        <div className="adm-content">{children}</div>
        <Shortcuts />
        <Toaster />
      </div>
    </div>
  );
}
