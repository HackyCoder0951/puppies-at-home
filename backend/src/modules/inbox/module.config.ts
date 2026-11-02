import type { ModuleDefinition } from '@backend/kernel';

export const moduleDefinition: ModuleDefinition = {
  id: 'inbox',
  description: 'Staff side of enquiries and customers: triage, assignment, notes, status and the customer directory.',
  routes: [
    { id: 'admin.enquiries', path: '/admin/enquiries', area: 'admin', access: 'authenticated' },
    { id: 'admin.customers', path: '/admin/customers', area: 'admin', access: 'authenticated' },
  ],
  permissions: ['enquiries.read', 'enquiries.write', 'enquiries.assign', 'customers.read', 'customers.write'],
  events: ['enquiry.status_changed', 'enquiry.assigned'],
};
