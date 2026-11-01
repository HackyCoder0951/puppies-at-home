import type { ReactNode } from 'react';
import { cn } from '@shared/lib';

export function Stamp({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-block -rotate-6 rounded-md border-[3px] border-toffee-deep px-3 py-1 font-[family-name:var(--font-hand)] text-lg font-bold uppercase tracking-wide text-toffee-deep', className)}>
      {children}
    </span>
  );
}
