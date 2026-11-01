import { PawIcon } from './icons';

/** Original placeholder wordmark; the reference's logo is not reused. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl font-black text-cocoa ${className ?? ''}`}>
      <PawIcon className="text-toffee-deep" />
      <span>
        Teddy<span className="text-toffee-deep">Pups</span>
      </span>
    </span>
  );
}
