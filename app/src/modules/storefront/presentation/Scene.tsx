import type { ReactNode } from 'react';
import { cn } from '@shared/lib';

/** A full-width page band with a named gradient background (see globals.css scene tokens). */
export function Scene({ gradient, dark = false, className, children, id }: { gradient: string; dark?: boolean; className?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className={cn('relative', dark ? 'text-milk' : 'text-cocoa-soft', className)} style={{ background: `var(--scene-${gradient})` }}>
      {children}
    </section>
  );
}
