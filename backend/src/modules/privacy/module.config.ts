import type { ModuleDefinition } from '@backend/kernel';

export const moduleDefinition: ModuleDefinition = {
  id: 'privacy',
  description: 'Data subject requests, subject export and erasure, processing restriction, consent withdrawal and the breach register.',
  routes: [{ id: 'admin.privacy', path: '/admin/privacy', area: 'admin', access: 'authenticated' }],
  permissions: ['privacy.read', 'privacy.manage', 'privacy.export', 'privacy.erase', 'privacy.intake'],
  events: ['privacy.export', 'privacy.anonymise'],
};
