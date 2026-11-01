import { cn } from '@shared/lib';

/** Static switch shell. Behaviour is attached by the feature that uses it. */
export function Toggle({ pressed, label }: { pressed: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-label={label}
      className={cn('relative h-8 w-14 rounded-full border-2 border-cocoa transition-colors', pressed ? 'bg-toffee-deep' : 'bg-honey-soft')}
    >
      <span className={cn('absolute top-0.5 size-6 rounded-full border-2 border-cocoa bg-milk transition-all duration-200 ease-(--ease-bounce)', pressed ? 'left-[26px]' : 'left-0.5')} />
    </button>
  );
}
