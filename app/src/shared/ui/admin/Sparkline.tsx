/** Tiny inline trend line. Decorative: the figure beside it carries the meaning, the label says what the line is. */
export function Sparkline({ values, label }: { values: readonly number[]; label: string }) {
  const max = Math.max(1, ...values);
  const w = 120;
  const h = 28;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${(h - 2 - (v / max) * (h - 4)).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label={`${label}: ${values.join(', ')}`} className="adm-spark">
      <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
