import { cn } from '@shared/lib';

export function Pin({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('absolute -top-2 left-1/2 block size-5 -translate-x-1/2 rounded-full border-2 border-cocoa bg-toffee shadow-[0_3px_0_rgb(42_23_14/0.4)]', className)} />;
}
