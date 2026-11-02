import Link from 'next/link';
import { EXPORT_KINDS, formatMinor, type DashboardStats } from '@backend/modules/reporting';
import { adminPaths } from '@nav';
import { ExportForm } from './ExportForm';
import { defaultExportRange } from './exportRange';

interface Card { label: string; value: string | number; href: string; tone?: 'alert' }

export function Dashboard({ stats: s }: { stats: DashboardStats }) {
  const cards: Card[] = [
    { label: 'New enquiries', value: s.enquiries.new, href: adminPaths.enquiries({ status: 'new' }) },
    { label: 'Open enquiries without an owner', value: s.enquiries.unassigned, href: adminPaths.enquiries() },
    { label: 'Open orders', value: s.orders.open, href: adminPaths.orders() },
    { label: 'Open deliveries', value: s.deliveries.open, href: adminPaths.deliveries() },
    { label: 'Delayed deliveries', value: s.deliveries.delayed, href: adminPaths.deliveries(), tone: s.deliveries.delayed ? 'alert' : undefined },
    { label: 'Received this month', value: formatMinor(s.money.paidThisMonthMinor), href: adminPaths.payments() },
    { label: 'Outstanding on invoices', value: formatMinor(s.money.outstandingMinor), href: adminPaths.invoices({ status: 'issued' }) },
    { label: 'Overdue invoices', value: s.money.overdueInvoices, href: adminPaths.invoices({ status: 'overdue' }), tone: s.money.overdueInvoices ? 'alert' : undefined },
    { label: 'Refunds waiting for approval', value: s.money.refundsWaiting, href: adminPaths.payments(), tone: s.money.refundsWaiting ? 'alert' : undefined },
    { label: 'Failed payments (7 days)', value: s.money.failedPayments7days, href: adminPaths.payments(), tone: s.money.failedPayments7days ? 'alert' : undefined },
    { label: 'Puppies available', value: s.puppies.available, href: adminPaths.puppies() },
    { label: 'Puppies reserved', value: s.puppies.reserved, href: adminPaths.puppies() },
  ];
  const range = defaultExportRange();
  return (
    <main className="grid gap-6">
      <h1 className="text-lg font-semibold">Overview</h1>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.label} className="adm-card grid gap-1">
            <span className="text-2xl font-semibold" style={c.tone ? { color: 'var(--adm-danger)' } : undefined}>{c.value}</span>
            <Link href={c.href} className="adm-link text-sm">{c.label}</Link>
          </li>
        ))}
      </ul>
      {s.system.outboxFailed || s.system.oldestPendingMinutes > 10 ? (
        <p role="status" className="adm-card text-sm" style={{ borderColor: 'var(--adm-danger)' }}>
          Messages: {s.system.outboxPending} waiting (oldest {s.system.oldestPendingMinutes} min), {s.system.outboxFailed} failed. Check the <Link href={adminPaths.messages({ status: 'failed' })} className="adm-link">message log</Link> and that the outbox cron is running.
        </p>
      ) : null}
      <ExportForm kinds={EXPORT_KINDS} defaultFrom={range.from} defaultTo={range.to} />
    </main>
  );
}
