import { describe, expect, it } from 'vitest';
import { adminPaths, safeAdminNext } from './admin';

describe('admin navigation', () => {
  it('only accepts same-site admin paths as redirect targets', () => {
    expect(safeAdminNext('/admin/orders')).toBe('/admin/orders');
    for (const bad of ['https://evil.test', '//evil.test', '/puppies', '/admin//x', 'javascript:alert(1)', '', null, undefined]) {
      expect(safeAdminNext(bad)).toBe(adminPaths.home());
    }
  });
  it('builds the login path with a safe next only', () => {
    expect(adminPaths.login('/admin/orders')).toBe('/admin/login?next=%2Fadmin%2Forders');
    expect(adminPaths.login('//evil.test')).toBe('/admin/login');
  });
});
