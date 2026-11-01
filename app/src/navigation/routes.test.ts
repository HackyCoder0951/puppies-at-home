import { describe, expect, it } from 'vitest';
import { isActive, menus, paths, sitemapPaths } from './routes';

describe('navigation', () => {
  it('builds filter queries with repeated keys', () => {
    expect(paths.puppies()).toBe('/puppies');
    expect(paths.puppies({ breed: ['Maltipoo', 'Pomeranian'], origin: 'imported' })).toBe(
      '/puppies?breed=Maltipoo&breed=Pomeranian&origin=imported',
    );
  });
  it('encodes puppy slugs and anchors', () => {
    expect(paths.puppy('max male')).toBe('/puppies/max%20male');
    expect(paths.howItWorks('delivery')).toBe('/how-it-works#delivery');
  });
  it('matches active routes by prefix', () => {
    expect(isActive('/puppies/max', '/puppies')).toBe(true);
    expect(isActive('/puppies', '/gone-home')).toBe(false);
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/faq', '/')).toBe(false);
    expect(isActive('/how-it-works', '/how-it-works#delivery')).toBe(true);
  });
  it('has six header links and lists static routes in the sitemap', () => {
    expect(menus.header).toHaveLength(6);
    expect(sitemapPaths()).toContain('/privacy');
    expect(sitemapPaths()).not.toContain('/dev/gallery');
  });
});
