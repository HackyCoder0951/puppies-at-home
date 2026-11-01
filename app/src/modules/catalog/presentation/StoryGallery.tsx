'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useSwipe } from '@shared/lib';
import { objectPosition, type Media } from '../domain';

const imgStyle = (m: Media) => ({
  position: 'absolute' as const, height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0,
  objectFit: 'cover' as const, objectPosition: objectPosition(m), color: 'transparent', backgroundColor: m.color,
});

/** Page-style gallery: big photo, previous/next, counter, thumbnails and a full-screen viewer (native dialog). */
export function StoryGallery({ media, name }: { media: readonly Media[]; name: string }) {
  const [at, setAt] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const [viewer, setViewer] = useState(false);
  const [dir, setDir] = useState(1);
  const n = media.length;
  const go = (i: number) => { setDir(i >= at ? 1 : -1); setAt(((i % n) + n) % n); };
  const swipe = useSwipe(() => go(at - 1), () => go(at + 1));
  const m = media[at];

  useEffect(() => {
    if (viewer && !dialog.current?.open) dialog.current?.showModal();
  }, [viewer]);

  if (!m) return null;
  const kind = (x: Media, i: number) => `${name}, ${x.kind === 'video' ? 'video' : 'photo'} ${i + 1} of ${n}`;
  return (
    <div>
      <div className="tp-storypage relative aspect-[4/5] md:aspect-[5/6]">
        <button type="button" className="absolute inset-0 block size-full" aria-label={`Open ${kind(m, at)} full screen`} onClick={() => setViewer(true)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static file copied from the reference */}
          <img key={m.id} alt={m.alt} loading="eager" style={imgStyle(m)} src={m.src} />
          {m.kind === 'video' && <span aria-hidden="true" className="absolute inset-0 grid place-items-center bg-cocoa/20 text-4xl text-milk">▶</span>}
        </button>
        <div className="absolute inset-x-4 bottom-4 flex justify-between">
          <button type="button" className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold" aria-label="Previous photo" onClick={() => go(at - 1)}>‹</button>
          <span className="self-center rounded-full bg-cocoa/80 px-3 py-1 text-sm font-semibold text-milk">{at + 1} / {n}</span>
          <button type="button" className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold" aria-label="Next photo" onClick={() => go(at + 1)}>›</button>
        </div>
      </div>
      <ul className="mt-3 flex gap-3 overflow-x-auto px-1 pb-2 pt-2 [scrollbar-width:thin]" aria-label={`All photos of ${name}`}>
        {media.map((x, i) => (
          <li key={x.id} className="shrink-0">
            <button
              type="button" aria-label={kind(x, i)} aria-current={i === at}
              onClick={() => setAt(i)}
              className={`relative block h-24 w-20 overflow-hidden rounded-[0.9rem] border-[3px] transition-transform duration-300 md:h-28 md:w-24 ${i === at ? '-rotate-3 -translate-y-1 border-toffee-deep' : 'border-cocoa/30 hover:-rotate-2 hover:border-cocoa'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static file copied from the reference */}
              <img alt="" loading="lazy" style={imgStyle(x)} src={x.src} />
              {x.kind === 'video' && <span className="absolute inset-0 grid place-items-center bg-cocoa/30 text-lg text-milk">▶</span>}
            </button>
          </li>
        ))}
      </ul>
      <dialog ref={dialog} aria-label={`${name} photos`} className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70" onClose={() => setViewer(false)} onClick={(e) => e.target === dialog.current && dialog.current?.close()}>
        {viewer && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="font-scrawl text-lg">{at + 1} / {n}</p>
              <button type="button" onClick={() => dialog.current?.close()} className="h-11 rounded-full bg-milk px-5 font-semibold text-cocoa">Close</button>
            </div>
            <div className="relative flex-1 overflow-hidden" {...swipe}>
              {m.kind === 'video' && m.videoSrc ? (
                <video key={m.id} src={m.videoSrc} poster={m.src} controls autoPlay playsInline style={{ '--dir': dir } as CSSProperties} className="viewer-enter absolute inset-0 size-full object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- static file copied from the reference
                <img key={m.id} src={m.src} alt={m.alt} draggable={false} style={{ '--dir': dir } as CSSProperties} className="viewer-enter absolute inset-0 size-full object-contain" />
              )}
            </div>
            <div className="flex justify-center gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
              <button type="button" onClick={() => go(at - 1)} className="h-12 rounded-full border-2 border-milk px-6 font-semibold">Previous</button>
              <button type="button" onClick={() => go(at + 1)} className="h-12 rounded-full bg-honey px-6 font-semibold text-cocoa">Next</button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
