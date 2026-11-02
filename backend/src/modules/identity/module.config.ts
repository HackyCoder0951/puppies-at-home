import type { ModuleDefinition } from '@backend/kernel';

export const moduleDefinition: ModuleDefinition = {
  id: 'identity',
  description: 'Staff sign-in, sign-out, password reset and the current staff member (roles super_admin and operator).',
  routes: [
    { id: 'admin.login', path: '/admin/login', area: 'admin', access: 'public' },
    { id: 'admin.forgot', path: '/admin/forgot-password', area: 'admin', access: 'public' },
    { id: 'admin.reset', path: '/admin/reset-password', area: 'admin', access: 'authenticated' },
  ],
  permissions: [],
  events: [],
};
