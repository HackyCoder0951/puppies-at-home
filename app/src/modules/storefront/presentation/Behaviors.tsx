'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Scroll-reveal for `[data-reveal]` elements: after hydration they are armed (hidden by CSS) and revealed
 * as they enter the viewport. Elements already in view are revealed straight away. Also marks the document ready.
 */
export function Behaviors() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.dataset.ready = 'true';
    const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { els.forEach((e) => { e.setAttribute('data-armed', ''); e.setAttribute('data-revealed', ''); }); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.setAttribute('data-revealed', ''); io.unobserve(en.target); }
      }),
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
    );
    els.forEach((e) => { e.setAttribute('data-armed', ''); io.observe(e); });
    return () => io.disconnect();
  }, [pathname]);
  /* Scenes know whether they are on screen (`data-here`) and whether they were ever seen (`data-visited`). */
  useEffect(() => {
    const scenes = [...document.querySelectorAll<HTMLElement>('[data-pup-scene]')];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        const el = en.target as HTMLElement;
        el.dataset.here = en.isIntersecting ? 'true' : 'false';
        if (en.isIntersecting) el.dataset.visited = 'true';
      }),
      { threshold: 0.25 },
    );
    scenes.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
