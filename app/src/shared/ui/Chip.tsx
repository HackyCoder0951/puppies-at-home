import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@shared/lib';

const chipClass = (selected: boolean) =>
  cn(
    'inline-flex min-h-11 items-center rounded-full border-2 border-cocoa px-4 py-[7px] text-[16px] font-semibold no-underline shadow-(--shadow-hard-sm) transition-colors duration-150',
    selected ? 'bg-cocoa text-milk' : 'bg-milk text-cocoa hover:bg-honey-soft',
  );

interface ChipProps {
  selected?: boolean;
  children: ReactNode;
  /** When set the chip is a link (filter chips are links so state lives in the URL). */
  href?: string;
}

export function Chip({ selected = false, children, href }: ChipProps) {
  if (href) {
    return (
      <Link href={href} className={chipClass(selected)} aria-current={selected ? 'true' : undefined}>
        {children}
      </Link>
    );
  }
  return (
    <span className={chipClass(selected)} aria-current={selected ? 'true' : undefined}>
      {children}
    </span>
  );
}
