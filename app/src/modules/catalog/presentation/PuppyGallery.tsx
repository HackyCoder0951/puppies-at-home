'use client';

import { useState } from 'react';
import { PlaceholderImage } from '@shared/ui';
import { cn } from '@shared/lib';
import type { Media } from '../domain';

export function PuppyGallery({ media }: { media: readonly Media[] }) {
  const [index, setIndex] = useState(0);
  const n = media.length;
  const current = media[index];
  if (!current) return null;
  const go = (d: number) => setIndex((i) => (i + d + n) % n);
  return (
    <section aria-label="Photos and videos" className="w-full">
      <div className="relative rotate-1 rounded-(--radius-card) border-[3px] border-cocoa bg-paper p-3 shadow-(--shadow-card)">
        <PlaceholderImage width={current.width} height={current.height} color={current.color} alt={current.alt} video={current.kind === 'video'} className="w-full" />
        <p className="absolute left-6 top-6 rounded-full bg-milk px-3 text-sm font-semibold" aria-live="polite">{index + 1} / {n}</p>
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-5 top-1/2 size-11 -translate-y-1/2 rounded-full border-2 border-cocoa bg-milk text-xl">‹</button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-5 top-1/2 size-11 -translate-y-1/2 rounded-full border-2 border-cocoa bg-milk text-xl">›</button>
          </>
        )}
      </div>
      {n > 1 && (
        <ul className="m-0 mt-5 flex list-none flex-wrap gap-3 p-0">
          {media.map((m, i) => (
            <li key={m.id}>
              <button type="button" onClick={() => setIndex(i)} aria-label={`Show ${m.kind} ${i + 1}`} aria-current={i === index} className={cn('block w-16 overflow-hidden rounded-lg border-2', i === index ? 'border-toffee-deep' : 'border-cocoa/40')}>
                <PlaceholderImage width={m.width} height={m.height} color={m.color} alt="" video={m.kind === 'video'} className="w-full" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
