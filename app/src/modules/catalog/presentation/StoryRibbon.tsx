'use client';

import { useEffect, useRef } from 'react';

/** Reading-progress ribbon on the left edge of a puppy page. */
export function StoryRibbon() {
  const band = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = band.current;
    const article = el?.closest('article');
    if (!el || !article) return;
    const tick = () => {
      const r = article.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (r.height + innerHeight * 0.0 || 1)));
      el.style.transform = `scaleY(${p.toFixed(3)})`;
    };
    tick();
    addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', tick);
    return () => { removeEventListener('scroll', tick); removeEventListener('resize', tick); };
  }, []);
  return (
    <div aria-hidden="true" className="tp-ribbon">
      <div className="tp-ribbon__track">
        <span ref={band} className="tp-ribbon__band" style={{ transform: 'scaleY(0)' }} />
      </div>
    </div>
  );
}
