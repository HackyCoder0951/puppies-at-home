/** Single-pose placeholder mascot (original simple SVG, replaced by artwork in F8 if supplied). */
export function Mascot({ className, title = 'Puppy mascot' }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 120 120" role="img" className={className} aria-label={title}>
      <ellipse cx="60" cy="108" rx="34" ry="6" fill="rgb(42 23 14 / 0.18)" />
      <ellipse cx="28" cy="52" rx="14" ry="24" fill="#d4893f" stroke="#2a170e" strokeWidth="3" transform="rotate(18 28 52)" />
      <ellipse cx="92" cy="52" rx="14" ry="24" fill="#d4893f" stroke="#2a170e" strokeWidth="3" transform="rotate(-18 92 52)" />
      <circle cx="60" cy="58" r="36" fill="#f2be6b" stroke="#2a170e" strokeWidth="3" />
      <circle cx="47" cy="52" r="4.5" fill="#2a170e" />
      <circle cx="73" cy="52" r="4.5" fill="#2a170e" />
      <ellipse cx="60" cy="66" rx="7" ry="5" fill="#2a170e" />
      <path d="M52 74q8 8 16 0" fill="none" stroke="#2a170e" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
