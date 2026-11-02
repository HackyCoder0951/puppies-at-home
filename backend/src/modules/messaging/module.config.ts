import type { ModuleDefinition } from '@backend/kernel';

export const moduleDefinition: ModuleDefinition = {
  id: 'messaging',
  description: 'Outbox worker, templates, notification rules, the message log and staff in-app notifications.',
  routes: [
    { id: 'admin.notifications', path: '/admin/notifications', area: 'admin', access: 'authenticated' },
    { id: 'admin.messages', path: '/admin/messages', area: 'admin', access: 'authenticated' },
    { id: 'admin.templates', path: '/admin/templates', area: 'admin', access: 'authenticated' },
  ],
  permissions: ['messages.read', 'messages.send', 'templates.read', 'templates.use', 'templates.edit', 'rules.manage', 'notifications.own'],
  events: ['message.failed'],
};
