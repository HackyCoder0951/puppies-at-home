'use client';

import { useEffect, useRef } from 'react';
import { pawModule } from './pup/engine.generated';

/** Faint paw prints that follow the mouse pointer (mouse users only; ported from the reference). */
export function PawTrail() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const path = new Path2D(pawModule.f);
    type Print = { x: number; y: number; angle: number; born: number };
    const prints: Print[] = [];
    let scale = 1;
    let raf = 0;
    let running = false;
    let lx = NaN;
    let ly = NaN;
    let travelled = 0;
    let side = 1;
    const size = () => {
      scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * scale;
      canvas.height = innerHeight * scale;
    };
    size();
    const draw = (t: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = prints.length - 1; i >= 0; i--) {
        const p = prints[i]!;
        const age = t - p.born;
        if (age > 1000) { prints.splice(i, 1); continue; }
        const k = age < 600 ? 1 : 1 - (age - 600) / 400;
        ctx.globalAlpha = 0.42 * k * k;
        ctx.setTransform(0.27 * scale, 0, 0, 0.27 * scale, p.x * scale, p.y * scale);
        ctx.rotate(p.angle);
        ctx.translate(-32, -34);
        ctx.fillStyle = '#c2622b';
        ctx.fill(path);
      }
      if (prints.length) raf = requestAnimationFrame(draw); else running = false;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (Number.isNaN(lx)) { lx = e.clientX; ly = e.clientY; return; }
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      travelled += Math.hypot(dx, dy);
      if (travelled >= 46) {
        travelled = 0;
        const a = Math.atan2(dy, dx) + Math.PI / 2;
        side = -side;
        const off = 7 * side;
        prints.push({ x: e.clientX + Math.cos(a) * off + 14, y: e.clientY + Math.sin(a) * off + 16, angle: a, born: performance.now() });
        if (prints.length > 14) prints.shift();
        if (!running) { running = true; raf = requestAnimationFrame(draw); }
      }
      lx = e.clientX;
      ly = e.clientY;
    };
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('resize', size);
    return () => {
      removeEventListener('pointermove', onMove);
      removeEventListener('resize', size);
      cancelAnimationFrame(raf);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] size-full" />;
}
