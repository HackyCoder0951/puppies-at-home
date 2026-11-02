import Link from 'next/link';
import { EXPORT_KINDS, formatMinor, type DashboardStats, type TrendSeries } from '@backend/modules/reporting';
import { adminPaths } from '@nav';
import { Kpi, PageHeader } from '@shared/ui/admin';
import { ExportForm } from './ExportForm';
import { defaultExportRange } from './exportRange';

const STAGES: { key: string; label: string }[] = [
  { key: 'new', label: 'New' }, { key: 'confirmed', label: 'Confirmed' }, { key: 'deposit_paid', label: 'Deposit paid' },
  { key: 'preparing', label: 'Preparing' }, { key: 'in_transit', label: 'In transit' }, { key: 'delivered', label: 'Delivered' },
];

/** Overview: what needs attention now, the numbers that matter, and the pipeline from enquiry to delivery. */
export function Dashboard({ stats: s, trends }: { stats: DashboardStats; trends: TrendSeries | null }) {
  const range = defaultExportRange();
  const attention = [
    { label: 'new enquiries', n: s.enquiries.new, href: adminPaths.enquiries({ status: 'new' }) },
    { label: 'enquiries without an owner', n: s.enquiries.unassigned, href: adminPaths.enquiries() },
    { label: 'overdue invoices', n: s.money.overdueInvoices, href: adminPaths.invoices({ status: 'overdue' }) },
    { label: 'refunds to approve', n: s.money.refundsWaiting, href: adminPaths.payments() },
    { label: 'failed payments (7 days)', n: s.money.failedPayments7days, href: adminPaths.payments() },
    { label: 'delayed deliveries', n: s.deliveries.delayed, href: adminPaths.deliveries() },
    { label: 'messages not delivered', n: s.system.outboxFailed, href: adminPaths.messages({ status: 'failed' }) },
  ].filter((a) => a.n > 0);
  const peak = Math.max(1, s.enquiries.open, ...STAGES.map((st) => s.orders.byStatus[st.key] ?? 0));
  const bar = (n: number) => ({ width: `${Math.max(2, Math.round((n / peak) * 100))}%` });
  return (
    <main className="grid gap-6">
      <PageHeader title="Overview" description="What needs you now, and how the shop is doing." />

      <section aria-labelledby="attention" className="grid gap-2">
        <h2 id="attention" className="text-sm font-semibold">Needs attention</h2>
        {attention.length === 0 ? <p className="adm-card text-sm">Nothing is waiting. Nice work.</p> : (
          <div className="adm-attention">
            {attention.map((a) => (<Link key={a.label} href={a.href} className="adm-chip" data-alert="true"><strong>{a.n}</strong> {a.label}</Link>))}
          </div>
        )}
      </section>

      <section aria-label="Key numbers" className="adm-kpis">
        <Kpi label="New enquiries" value={s.enquiries.new} href={adminPaths.enquiries({ status: 'new' })} note={`${s.enquiries.last7days} in the last 7 days`} trend={trends?.enquiries} trendLabel="Enquiries per day, last 14 days" />
        <Kpi label="Orders in progress" value={s.orders.open} href={adminPaths.orders()} note={`${s.orders.createdThisMonth} created this month`} trend={trends?.orders} trendLabel="Orders created per day, last 14 days" />
        <Kpi label="Received this month" value={formatMinor(s.money.paidThisMonthMinor)} href={adminPaths.payments()} note="after refunds" trend={trends?.receivedMinor.map((m) => Math.round(m / 100))} trendLabel="AED received per day, last 14 days" />
        <Kpi label="Outstanding on invoices" value={formatMinor(s.money.outstandingMinor)} href={adminPaths.invoices({ status: 'issued' })} alert={s.money.overdueInvoices > 0} note={s.money.overdueInvoices ? `${s.money.overdueInvoices} overdue` : 'none overdue'} />
      </section>

      <section className="adm-card grid gap-3" aria-labelledby="pipeline">
        <h2 id="pipeline" className="font-semibold">Pipeline</h2>
        <p className="adm-muted text-sm">Open enquiries, then orders by stage.</p>
        <ul className="grid gap-2">
          {[{ key: 'enq', label: 'Open enquiries', n: s.enquiries.open, href: adminPaths.enquiries() }, ...STAGES.map((st) => ({ key: st.key, label: st.label, n: s.orders.byStatus[st.key] ?? 0, href: adminPaths.orders() }))].map((row) => (
            <li key={row.key} className="grid grid-cols-[140px_1fr_40px] items-center gap-3 text-sm">
              <Link href={row.href} className="adm-link">{row.label}</Link>
              <div className="rounded-full" style={{ background: 'var(--surface-2)' }} aria-hidden="true"><div className="h-2.5 rounded-full" style={{ ...bar(row.n), background: row.key === 'enq' ? 'var(--accent-2)' : 'var(--accent)' }} /></div>
              <span className="num font-semibold">{row.n}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="adm-kpis" aria-label="Catalogue">
        <Kpi label="Puppies available" value={s.puppies.available} href={adminPaths.puppies()} />
        <Kpi label="Puppies reserved" value={s.puppies.reserved} href={adminPaths.puppies()} />
        <Kpi label="Drafts to finish" value={s.puppies.drafts} href={adminPaths.puppies()} />
      </section>

      <ExportForm kinds={EXPORT_KINDS} defaultFrom={range.from} defaultTo={range.to} />
    </main>
  );
}
