import type { ModuleDefinition } from '@shared/kernel';

export const moduleDefinition: ModuleDefinition = {
  id: 'crm',
  description:
    'Customer relationships and customer privacy: enquiry submission now (mock), consent and data requests later.',
  routes: [],
  permissions: [],
  events: ['EnquirySubmitted'],
};
