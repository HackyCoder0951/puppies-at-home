import type { ReactNode } from 'react';
import { cn } from '@shared/lib';

export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[340px] rounded-(--radius-phone) border-[6px] border-cocoa bg-milk p-3 shadow-(--shadow-card)', className)}>
      <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-cocoa/30" aria-hidden="true" />
      {children}
    </div>
  );
}
