import type { ReactNode } from 'react';
import { cn } from '@shared/lib';

/** Ticket with a stub: main body left, honey stub right, notches cut with radial masks. */
export function TicketShape({ children, stub, className }: { children: ReactNode; stub?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex overflow-hidden rounded-2xl border-[3px] border-cocoa bg-milk', className)}>
      <div className="flex-1 p-6">{children}</div>
      {stub && <div className="flex min-w-28 items-center justify-center border-l-[3px] border-dashed border-cocoa bg-[#e2b164] p-4 font-[family-name:var(--font-hand)] font-bold text-cocoa">{stub}</div>}
    </div>
  );
}
