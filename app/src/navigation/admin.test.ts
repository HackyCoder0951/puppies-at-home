import { describe, expect, it } from 'vitest';
import { adminPaths, safeAdminNext } from './admin';

describe('admin navigation', () => {
  it('only accepts same-site admin paths as redirect targets', () => {
    expect(safeAdminNext('/admin/orders')).toBe('/admin/orders');
    expect(safeAdminNext('/admin/orders/new?customer=abc-1&puppy=x')).toBe('/admin/orders/new?customer=abc-1&puppy=x');
    for (const bad of ['https://evil.test', '//evil.test', '/puppies', '/admin//x', '/admin?next=//evil.test', '/admin/x?a=<script>', 'javascript:alert(1)', '', null, undefined]) {
      expect(safeAdminNext(bad)).toBe(adminPaths.home());
    }
  });
  it('builds the login path with a safe next only', () => {
    expect(adminPaths.login('/admin/orders')).toBe('/admin/login?next=%2Fadmin%2Forders');
    expect(adminPaths.login('//evil.test')).toBe('/admin/login');
  });
});
