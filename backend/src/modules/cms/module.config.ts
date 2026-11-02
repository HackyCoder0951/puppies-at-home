import type { ModuleDefinition } from '@backend/kernel';

export const moduleDefinition: ModuleDefinition = {
  id: 'cms',
  description: 'Staff content management: puppies and their media, FAQs, site settings and the featured testimonial.',
  routes: [
    { id: 'admin.puppies', path: '/admin/puppies', area: 'admin', access: 'authenticated' },
    { id: 'admin.faqs', path: '/admin/faqs', area: 'admin', access: 'authenticated' },
    { id: 'admin.settings', path: '/admin/settings', area: 'admin', access: 'authenticated' },
  ],
  permissions: ['content.read', 'content.write', 'content.publish', 'content.delete', 'settings.read', 'settings.write'],
  events: ['content.changed'],
};
