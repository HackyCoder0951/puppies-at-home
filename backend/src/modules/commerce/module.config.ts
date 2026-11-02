import type { ModuleDefinition } from '@backend/kernel';

export const moduleDefinition: ModuleDefinition = {
  id: 'commerce',
  description: 'Orders, their items and timeline, and deliveries with tracking events; status machines are enforced in the database.',
  routes: [
    { id: 'admin.orders', path: '/admin/orders', area: 'admin', access: 'authenticated' },
    { id: 'admin.deliveries', path: '/admin/deliveries', area: 'admin', access: 'authenticated' },
  ],
  permissions: ['orders.read', 'orders.write', 'orders.cancel', 'deliveries.read', 'deliveries.write'],
  events: ['order.status_changed', 'delivery.status_changed'],
};
