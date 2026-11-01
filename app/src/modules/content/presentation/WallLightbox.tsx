'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useSwipe } from '@shared/lib';
import type { FamilyPhoto } from '../domain';

/** Wraps the photo wall: a click on any print opens the viewer (native dialog: focus trap and Esc). Arrow keys and buttons move between photos. */
export function WallLightbox({ photos, children }: { photos: readonly FamilyPhoto[]; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [at, setAt] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const n = photos.length;
  const go = (i: number) => { setDir(i >= (at ?? 0) ? 1 : -1); setAt(((i % n) + n) % n); };
  const swipe = useSwipe(() => go((at ?? 0) - 1), () => go((at ?? 0) + 1));
  const current = at === null ? undefined : photos[at];

  useEffect(() => {
    if (at !== null && !dialog.current?.open) dialog.current?.showModal();
  }, [at]);

  useEffect(() => {
    if (at === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(at + 1);
      if (e.key === 'ArrowLeft') go(at - 1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  return (
    <>
      <div
        onClick={(e) => {
          const btn = (e.target as Element).closest<HTMLButtonElement>('.tp-wall__print');
          if (!btn) return;
          const item = btn.closest('.tp-wall__item');
          const index = item ? [...(item.parentElement?.children ?? [])].indexOf(item) : -1;
          if (index >= 0) { opener.current = btn; setAt(index); }
        }}
      >
        {children}
      </div>
      <dialog
        ref={dialog}
        aria-label="Photo viewer"
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70"
        onClose={() => { setAt(null); opener.current?.focus(); }}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        {current && at !== null && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="font-scrawl text-lg">{at + 1} / {n}{current.caption ? ` — ${current.caption}` : ''}</p>
              <button type="button" onClick={() => dialog.current?.close()} className="h-11 rounded-full bg-milk px-5 font-semibold text-cocoa">Close</button>
            </div>
            <div className="relative flex-1 overflow-hidden" {...swipe}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static file copied from the reference */}
              <img key={current.id} src={current.src} alt={current.alt} draggable={false} style={{ '--dir': dir } as CSSProperties} className="viewer-enter absolute inset-0 size-full object-contain" />
            </div>
            <div className="flex justify-center gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
              <button type="button" onClick={() => go(at - 1)} className="h-12 rounded-full border-2 border-milk px-6 font-semibold">Previous</button>
              <button type="button" onClick={() => go(at + 1)} className="h-12 rounded-full bg-honey px-6 font-semibold text-cocoa">Next</button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
