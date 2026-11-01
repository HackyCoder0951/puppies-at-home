'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * The airplane on the Korea to Dubai route moves along its path as the block scrolls through the screen
 * (progress runs from "block top at 95% of the window" to "block bottom at 25%"). Ported from the reference. Renders nothing.
 */
export function Flight() {
  const pathname = usePathname();
  useEffect(() => {
    const blocks = [...document.querySelectorAll<HTMLElement>('.tp-flight')];
    if (!blocks.length) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const place = (block: HTMLElement, progress: number) => {
      const route = block.querySelector<SVGPathElement>('.tp-flight__route');
      const plane = route?.parentElement?.querySelector<SVGGElement>(':scope > g');
      if (!route || !plane) return;
      const len = route.getTotalLength();
      const at = Math.min(len, Math.max(0, progress * len));
      const p = route.getPointAtLength(at);
      const next = route.getPointAtLength(Math.min(len, at + 1));
      const prev = route.getPointAtLength(Math.max(0, at - 1));
      const angle = (180 * Math.atan2(next.y - prev.y, next.x - prev.x)) / Math.PI;
      plane.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${angle.toFixed(1)})`);
      plane.style.opacity = String(Math.min(1, Math.max(0, (progress - 0.11) / 0.06)));
    };
    const update = () => {
      blocks.forEach((b) => {
        if (reduced) return place(b, 0.62);
        const r = b.getBoundingClientRect();
        const vh = innerHeight;
        place(b, Math.min(1, Math.max(0, (0.95 * vh - r.top) / (0.7 * vh + r.height))));
      });
    };
    update();
    if (reduced) return;
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    return () => { removeEventListener('scroll', update); removeEventListener('resize', update); };
  }, [pathname]);
  return null;
}
