import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getIdentity, getMessaging } from '@composition';
import { adminPaths } from '@nav';
import { signOutAction } from '../actions';

const BASE_LINKS = [
  { href: adminPaths.home(), label: 'Overview' },
  { href: adminPaths.enquiries(), label: 'Enquiries' },
  { href: adminPaths.customers(), label: 'Customers' },
  { href: adminPaths.orders(), label: 'Orders' },
  { href: adminPaths.deliveries(), label: 'Deliveries' },
  { href: adminPaths.invoices(), label: 'Invoices' },
  { href: adminPaths.payments(), label: 'Payments' },
  { href: adminPaths.puppies(), label: 'Puppies' },
  { href: adminPaths.faqs(), label: 'FAQs' },
  { href: adminPaths.messages(), label: 'Messages' },
  { href: adminPaths.templates(), label: 'Templates' },
  { href: adminPaths.rules(), label: 'Rules' },
  { href: adminPaths.privacy(), label: 'Privacy' },
  { href: adminPaths.settings(), label: 'Settings' },
];

/** Second gate behind `proxy.ts`: a verified session with an active staff profile is needed for every portal page. */
export default async function PortalLayout({ children }: { children: ReactNode }) {
  const staff = await (await getIdentity()).currentStaff();
  if (!staff) redirect(adminPaths.login());
  const unreadResult = await (await getMessaging()).unreadCount();
  const unread = unreadResult.ok ? unreadResult.value : 0;
  const LINKS = [{ href: adminPaths.notifications(), label: unread ? `Notifications (${unread})` : 'Notifications' }, ...BASE_LINKS];
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <nav aria-label="Admin" className="flex flex-wrap gap-4">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="adm-link">{l.label}</Link>
          ))}
        </nav>
        <form action={signOutAction} className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--adm-muted)' }}>{staff.fullName} ({staff.role === 'super_admin' ? 'Super admin' : 'Operator'})</span>
          <button type="submit" className="adm-btn">Sign out</button>
        </form>
      </header>
      {children}
    </div>
  );
}
