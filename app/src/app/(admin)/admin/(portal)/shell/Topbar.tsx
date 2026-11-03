'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { CommandPalette, type PaletteEntry } from './CommandPalette';
import { LiveBell, type LiveConfig } from './LiveBell';
import { ThemeToggle } from './ThemeToggle';

const LABEL: Record<string, string> = {
  admin: 'Overview', enquiries: 'Enquiries', customers: 'Customers', orders: 'Orders', new: 'New', deliveries: 'Deliveries', invoices: 'Invoices', print: 'Print', payments: 'Payments',
  puppies: 'Puppies', faqs: 'FAQs', notifications: 'Notifications', messages: 'Messages', templates: 'Templates', rules: 'Rules', users: 'Staff', privacy: 'Privacy', settings: 'Settings', security: 'My security',
};
const ID = /^[0-9a-f]{8}-|^\d+$/i;

export function Topbar({ env, mode, unread, live, staffName, palette, children }: { env: string; mode: 'light' | 'dark' | 'system'; unread: number; live?: LiveConfig; staffName: string; palette: readonly PaletteEntry[]; children?: ReactNode }) {
  const parts = usePathname().split('/').filter(Boolean);
  const crumbs = parts.map((p, i) => ({ href: `/${parts.slice(0, i + 1).join('/')}`, label: ID.test(p) ? 'Record' : (LABEL[p] ?? p) }));
  return (
    <header className="adm-topbar">
      <nav aria-label="Breadcrumb" className="adm-crumbs">
        {crumbs.map((c, i) => (i === crumbs.length - 1 ? <span key={c.href} aria-current="page" className="font-semibold" style={{ color: 'var(--ink)' }}>{c.label}</span> : <span key={c.href}><Link href={c.href}>{c.label}</Link> /</span>))}
      </nav>
      <CommandPalette entries={palette} />
      <LiveBell unread={unread} live={live} />
      <span className="adm-env" data-env={env} title={env === 'production' ? 'Live data' : 'Not live data'}>{env === 'production' ? 'Production' : env === 'preview' ? 'Preview' : 'Local'}</span>
      <ThemeToggle initial={mode} />
      <span className="adm-muted text-sm">{staffName}</span>
      {children}
    </header>
  );
}
