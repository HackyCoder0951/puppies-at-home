import type { ReactNode } from 'react';
import { cn } from '@shared/lib';
import { Tape } from './Tape';

/** Photo frame. Pass the image as children; the caption renders on the paper margin. */
export function Polaroid({ children, caption, tilt = -2, className }: { children: ReactNode; caption?: string; tilt?: number; className?: string }) {
  return (
    <figure
      className={cn('relative m-0 rounded-(--radius-polaroid) bg-paper p-3 pb-5 shadow-md transition-shadow duration-300 hover:shadow-(--shadow-lift)', className)}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <Tape />
      <div className="overflow-hidden">{children}</div>
      {caption && <figcaption className="mt-3 text-center font-[family-name:var(--font-hand)] text-base text-cocoa">{caption}</figcaption>}
    </figure>
  );
}
