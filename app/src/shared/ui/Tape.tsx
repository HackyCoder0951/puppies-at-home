import { cn } from '@shared/lib';

export function Tape({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('absolute -top-3 left-1/2 block h-6 w-24 -translate-x-1/2 -rotate-3 bg-honey/70', className)} />;
}
