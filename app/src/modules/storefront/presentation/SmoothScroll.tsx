'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';

/** Inertial scrolling for mouse users, with the same settings as the reference. Skipped for touch and reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const root = document.documentElement;
    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      wheelMultiplier: 0.85,
      prevent: (node) => !!node.closest?.('dialog, [data-lenis-prevent]'),
      virtualScroll: () => getComputedStyle(root).overflowY !== 'hidden',
    });
    const settle = () => lenis.scrollTo(lenis.actualScroll, { immediate: true });
    addEventListener('tp:navigate', settle);
    addEventListener('popstate', settle);
    let raf = requestAnimationFrame(function tick(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('tp:navigate', settle);
      removeEventListener('popstate', settle);
      lenis.destroy();
    };
  }, []);
  return null;
}
