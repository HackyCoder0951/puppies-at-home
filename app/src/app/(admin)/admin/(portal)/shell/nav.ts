import { adminPaths } from '@nav';

export interface NavItem { readonly href: string; readonly label: string; readonly glyph: string; readonly count?: number; readonly alert?: boolean }
export interface NavGroup { readonly heading: string; readonly items: readonly NavItem[] }

export interface NavCounts { readonly unread: number; readonly newEnquiries: number; readonly openOrders: number; readonly delayedDeliveries: number; readonly overdueInvoices: number; readonly refundsWaiting: number; readonly outboxFailed: number }

/** Grouped navigation. Items a role cannot use are not rendered (the database still enforces every permission). */
export function navGroups(counts: NavCounts, superAdmin: boolean): NavGroup[] {
  return [
    { heading: 'Work', items: [
      { href: adminPaths.home(), label: 'Overview', glyph: 'Ov' },
      { href: adminPaths.enquiries(), label: 'Enquiries', glyph: 'En', count: counts.newEnquiries },
      { href: adminPaths.customers(), label: 'Customers', glyph: 'Cu' },
      { href: adminPaths.orders(), label: 'Orders', glyph: 'Or', count: counts.openOrders },
      { href: adminPaths.deliveries(), label: 'Deliveries', glyph: 'De', count: counts.delayedDeliveries, alert: true },
    ] },
    { heading: 'Money', items: [
      { href: adminPaths.invoices(), label: 'Invoices', glyph: 'In', count: counts.overdueInvoices, alert: true },
      { href: adminPaths.payments(), label: 'Payments', glyph: 'Pa', count: counts.refundsWaiting, alert: true },
    ] },
    { heading: 'Catalogue', items: [
      { href: adminPaths.puppies(), label: 'Puppies', glyph: 'Pu' },
      { href: adminPaths.faqs(), label: 'FAQs', glyph: 'FA' },
    ] },
    { heading: 'Comms', items: [
      { href: adminPaths.notifications(), label: 'Notifications', glyph: 'No', count: counts.unread },
      { href: adminPaths.messages(), label: 'Messages', glyph: 'Me', count: counts.outboxFailed, alert: true },
      { href: adminPaths.templates(), label: 'Templates', glyph: 'Te' },
      ...(superAdmin ? [{ href: adminPaths.rules(), label: 'Rules', glyph: 'Ru' }] : []),
    ] },
    { heading: 'System', items: [
      ...(superAdmin ? [{ href: adminPaths.users(), label: 'Staff', glyph: 'St' }] : []),
      { href: adminPaths.privacy(), label: 'Privacy', glyph: 'Pr' },
      { href: adminPaths.settings(), label: 'Settings', glyph: 'Se' },
      { href: adminPaths.security(), label: 'My security', glyph: 'My' },
    ] },
  ];
}
