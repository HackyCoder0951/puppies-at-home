import type { ModuleDefinition } from '@backend/kernel';

export const moduleDefinition: ModuleDefinition = {
  id: 'billing',
  description: 'Invoices with VAT, the payment ledger (manual now, gateways later), refunds with two-step approval, and the default tax rate.',
  routes: [
    { id: 'admin.invoices', path: '/admin/invoices', area: 'admin', access: 'authenticated' },
    { id: 'admin.payments', path: '/admin/payments', area: 'admin', access: 'authenticated' },
  ],
  permissions: ['invoices.read', 'invoices.write', 'invoices.issue', 'invoices.void', 'payments.read', 'payments.record', 'payments.refund.request', 'payments.refund.approve', 'settings.write'],
  events: ['invoice.issued', 'payment.recorded', 'refund.processed'],
};
