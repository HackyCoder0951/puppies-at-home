import type { ReactNode } from 'react';
import { cn } from '@shared/lib';

const kinds = {
  info: 'bg-milk',
  form: 'bg-milk p-6 md:p-8',
  step: 'bg-honey-soft',
} as const;

export function Card({ kind = 'info', tilt = 0, className, children }: { kind?: keyof typeof kinds; tilt?: number; className?: string; children: ReactNode }) {
  return (
    <div
      className={cn('rounded-(--radius-card) border-[3px] border-cocoa shadow-(--shadow-card)', kinds[kind], className)}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
    >
      {children}
    </div>
  );
}
