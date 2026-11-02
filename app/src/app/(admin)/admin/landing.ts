/** Pages a person may choose to open after signing in. */
export const LANDING_PAGES = [
  { path: '/admin', label: 'Overview' }, { path: '/admin/enquiries', label: 'Enquiries' }, { path: '/admin/orders', label: 'Orders' },
  { path: '/admin/deliveries', label: 'Deliveries' }, { path: '/admin/invoices', label: 'Invoices' },
] as const;
