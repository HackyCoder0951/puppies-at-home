'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { attachPup } from './pup/attachPup';

/** Mascots that tilt their head while idle (as on the reference). */
const TILTERS = '.tp-journeys__teddy, .tp-notes__teddy .pup-buddy, .tp-sketchbook__self .pup-buddy';

/** Animates every mascot on the page. Renders nothing. */
export function LivePups() {
  const pathname = usePathname();
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const stops = [...document.querySelectorAll<HTMLElement>('.pup-buddy')];
    const cleanups = stops.map((el) => {
      const stop = el.closest<HTMLElement>('.pup-stop');
      const pose = stop?.dataset.pose ?? 'sit';
      const facing = (stop?.dataset.facing ?? el.dataset.facing) === 'left' ? 'left' : 'right';
      const act = stop?.dataset.act ?? (el.matches(TILTERS) ? 'tilt' : undefined);
      return attachPup(el, { pose, facing, act, asStop: Boolean(stop) });
    });
    return () => cleanups.forEach((c) => c());
  }, [pathname]);
  return null;
}
