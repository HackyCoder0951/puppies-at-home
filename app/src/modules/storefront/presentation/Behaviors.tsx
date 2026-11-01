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
    const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')];
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((e) => { e.dataset.revealed = 'true'; });
      return;
    }
    const curtainDown = () => ['covering', 'covered', 'snap'].includes(document.documentElement.dataset.curtain ?? '');
    const pending = new Set<HTMLElement>();
    const reveal = (e: HTMLElement) => { e.dataset.revealed = 'true'; io.unobserve(e); };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const e = en.target as HTMLElement;
        if (curtainDown()) pending.add(e); else reveal(e);
      }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
    );
    els.forEach((e) => {
      const r = e.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0 && !curtainDown()) { e.dataset.revealed = 'true'; return; }
      e.dataset.armed = 'true';
      io.observe(e);
    });
    const flush = () => { pending.forEach(reveal); pending.clear(); };
    addEventListener('tp:arrived', flush);
    let timer: ReturnType<typeof setTimeout>;
    const settle = () => (curtainDown() ? (timer = setTimeout(settle, 400)) : flush());
    timer = setTimeout(settle, 1600);
    return () => { clearTimeout(timer); io.disconnect(); removeEventListener('tp:arrived', flush); };
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
