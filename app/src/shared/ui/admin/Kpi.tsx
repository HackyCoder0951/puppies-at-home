import Link from 'next/link';
import { Sparkline } from './Sparkline';

/** One headline number that links to the filtered list behind it. */
export function Kpi({ label, value, href, note, alert, trend, trendLabel }: { label: string; value: string | number; href: string; note?: string; alert?: boolean; trend?: readonly number[]; trendLabel?: string }) {
  return (
    <Link href={href} className="adm-card adm-kpi">
      <span className="adm-muted text-xs font-semibold uppercase tracking-wide">{label}</span>
      <span className="adm-figure" style={alert ? { color: 'var(--danger)' } : undefined}>{value}</span>
      {trend ? <Sparkline values={trend} label={trendLabel ?? `${label}, last ${trend.length} days`} /> : null}
      {note ? <span className="adm-muted text-xs">{note}</span> : null}
    </Link>
  );
}
