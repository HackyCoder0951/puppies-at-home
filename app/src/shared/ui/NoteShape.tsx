import type { ReactNode } from 'react';
import { cn } from '@shared/lib';
import { Pin } from './Pin';

/** Pinned paper note with a folded corner (FAQ board). */
export function NoteShape({ children, tilt = 1, className }: { children: ReactNode; tilt?: number; className?: string }) {
  return (
    <div
      className={cn('relative rounded-md border-[3px] border-cocoa bg-note p-6 [clip-path:polygon(0_0,100%_0,100%_calc(100%-24px),calc(100%-24px)_100%,0_100%)]', className)}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <Pin />
      {children}
    </div>
  );
}
