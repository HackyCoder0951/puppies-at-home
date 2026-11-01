import { cn } from '@shared/lib';

/** Scalloped bottom edge: place at the bottom of a coloured band; `color` is any CSS colour. */
export function Scallop({ color = 'var(--color-milk)', className }: { color?: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('h-3 w-full', className)}
      style={{ backgroundImage: `radial-gradient(circle at 6px 0, ${color} 6px, transparent 6.5px)`, backgroundSize: '12px 12px', backgroundRepeat: 'repeat-x', backgroundPosition: '0 0', transform: 'scaleY(-1)' }}
    />
  );
}

/** Wave divider: fill with the colour of the section that follows. */
export function Wave({ color = 'var(--color-night)', className }: { color?: string; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className={cn('block h-14 w-full md:h-20', className)}>
      <path d="M0 40 C 180 90 360 0 540 40 S 900 80 1080 40 S 1300 10 1440 40 V80 H0 Z" fill={color} />
    </svg>
  );
}

const grounds = { dots: 'pattern-dots', stripes: 'pattern-stripes', planks: 'pattern-planks', quilt: 'pattern-quilt' } as const;

/** Decorative pattern surface: paper dot grid, wallpaper stripes, plank floor or quilt. */
export function PatternGround({ kind, className }: { kind: keyof typeof grounds; className?: string }) {
  return <div aria-hidden="true" className={cn('absolute inset-0 -z-10', grounds[kind], className)} />;
}
