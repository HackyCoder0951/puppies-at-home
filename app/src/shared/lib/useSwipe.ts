import { useRef, type CSSProperties, type PointerEvent } from 'react';

/** Horizontal swipe detection for touch and mouse drags (80 px threshold, mostly sideways). */
export function useSwipe(onPrev: () => void, onNext: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    style: { touchAction: 'pan-y' } as CSSProperties,
    onPointerDown: (e: PointerEvent) => { start.current = { x: e.clientX, y: e.clientY }; },
    onPointerCancel: () => { start.current = null; },
    onPointerUp: (e: PointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? onNext : onPrev)();
    },
  };
}
