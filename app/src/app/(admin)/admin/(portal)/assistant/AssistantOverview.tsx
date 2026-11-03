import Link from 'next/link';
import type { AssistantOverview as Overview } from '@backend/modules/reporting';
import { adminPaths } from '@nav';
import { Badge, PageHeader } from '@shared/ui/admin';

const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : '—');

/** Reviewer view: figures without text, then the latest redacted conversations (emails and phone numbers were removed before storage). */
export function AssistantOverview({ data }: { data: Overview }) {
  const o = data.outcomes;
  const rated = (data.feedback.up ?? 0) + (data.feedback.down ?? 0);
  const stat = (label: string, value: string | number, note?: string) => (
    <div className="adm-card adm-kpi"><span className="adm-muted text-xs font-semibold uppercase tracking-wide">{label}</span><span className="adm-figure">{value}</span>{note ? <span className="adm-muted text-xs">{note}</span> : null}</div>
  );
  return (
    <main className="grid gap-4">
      <PageHeader title="Assistant" description={`Last ${data.days} days. Chats are kept 30 days; figures are kept 12 months. Reading chats is for quality review only.`} />
      <nav aria-label="Period" className="adm-attention">{[7, 30, 90].map((d) => (<Link key={d} href={`${adminPaths.assistant()}?days=${d}`} className="adm-chip" aria-current={data.days === d ? 'page' : undefined}>{d} days</Link>))}</nav>
      <section aria-label="Figures" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stat('Answers', data.turns, `${data.tokens.in.toLocaleString('en-GB')} tokens in, ${data.tokens.out.toLocaleString('en-GB')} out`)}
        {stat('Replaced answers', pct(o.replaced ?? 0, data.turns), 'unverified text swapped for the fallback')}
        {stat('Helpful ratings', rated ? pct(data.feedback.up ?? 0, rated) : '—', `${rated} rated`)}
        {stat('Hand-over clicks', data.feedback.handover ?? 0, `${data.feedback.link ?? 0} puppy link clicks`)}
        {stat('Average time', data.avgLatencyMs ? `${(data.avgLatencyMs / 1000).toFixed(1)} s` : '—', 'per answer')}
        {stat('Errors', o.error ?? 0)}
        {stat('Fixed replies', o.canned ?? 0, 'prices, rule-breaking, emergencies')}
        <div className="adm-card adm-kpi"><span className="adm-muted text-xs font-semibold uppercase tracking-wide">Policy modes</span><span className="flex flex-wrap gap-2 pt-1">{Object.entries(data.modes).map(([m, n]) => (<Badge key={m} tone="info">{m} {n}</Badge>))}{Object.keys(data.modes).length ? null : '—'}</span></div>
      </section>
      <section aria-label="Recent conversations" className="grid gap-3">
        <h2 className="text-lg font-semibold">Latest conversations</h2>
        {data.conversations.length === 0 ? <p className="adm-muted">No conversations in this period.</p> : data.conversations.map((c) => (
          <details key={c.id} className="adm-card">
            <summary className="cursor-pointer font-semibold">{new Date(c.startedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} · {c.messages.length} messages</summary>
            <ol className="mt-3 grid gap-2">{c.messages.map((m, i) => (<li key={i}><span className="adm-muted text-xs">{m.role === 'user' ? 'Visitor' : 'Assistant'}</span><p className="whitespace-pre-wrap">{m.text}</p></li>))}</ol>
          </details>
        ))}
      </section>
    </main>
  );
}
