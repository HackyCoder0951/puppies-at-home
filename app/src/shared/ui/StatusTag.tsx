import type { ReactNode } from 'react';
import { cn } from '@shared/lib';

const tones = {
  available: 'bg-honey text-cocoa',
  home: 'bg-cocoa text-milk',
  neutral: 'bg-honey-soft text-cocoa',
} as const;

export function StatusTag({ tone = 'neutral', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-block -rotate-2 rounded-full border-2 border-cocoa px-3 py-0.5 font-[family-name:var(--font-hand)] text-sm font-semibold',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
