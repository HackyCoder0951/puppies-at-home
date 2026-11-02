import type { ModuleDefinition } from '@backend/kernel';

export const moduleDefinition: ModuleDefinition = {
  id: 'reporting',
  description: 'Dashboard figures from one database call, and audited, rate-limited CSV exports for super admins.',
  routes: [{ id: 'admin.home', path: '/admin', area: 'admin', access: 'authenticated' }],
  permissions: ['dashboard.read', 'enquiries.export', 'payments.export'],
  events: ['export.created'],
};
