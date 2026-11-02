import Link from 'next/link';

/** One headline number that links to the filtered list behind it. */
export function Kpi({ label, value, href, note, alert }: { label: string; value: string | number; href: string; note?: string; alert?: boolean }) {
  return (
    <Link href={href} className="adm-card adm-kpi">
      <span className="adm-muted text-xs font-semibold uppercase tracking-wide">{label}</span>
      <span className="adm-figure" style={alert ? { color: 'var(--danger)' } : undefined}>{value}</span>
      {note ? <span className="adm-muted text-xs">{note}</span> : null}
    </Link>
  );
}
