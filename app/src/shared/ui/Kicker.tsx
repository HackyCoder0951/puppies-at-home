import type { ReactNode } from 'react';

/** Handwritten eyebrow text with a hand-drawn underline. */
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="relative inline-block font-[family-name:var(--font-hand)] text-[23px] font-medium text-toffee-ink">
      {children}
      <svg aria-hidden="true" viewBox="0 0 200 10" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-2 w-full text-toffee">
        <path d="M2 6 Q 30 1 60 6 T 120 5 T 198 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </p>
  );
}
