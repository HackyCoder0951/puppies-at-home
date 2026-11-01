'use client';

import { useEffect, useRef, useState } from 'react';
import { PlaceholderImage, Polaroid } from '@shared/ui';
import type { FamilyPhoto } from '../domain';

/** Polaroid wall in CSS columns with a keyboard-operable lightbox (native dialog: focus trap and Esc). */
export function FamilyWall({ photos }: { photos: readonly FamilyPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const n = photos.length;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const show = (i: number) => setOpen((i + n) % n);
  const close = () => {
    setOpen(null);
    opener.current?.focus();
  };
  const current = open !== null ? photos[open] : undefined;

  return (
    <>
      <ul className="m-0 mt-12 columns-2 gap-6 p-0 md:columns-3 xl:columns-4">
        {photos.map((p, i) => (
          <li key={p.id} className="mb-8 list-none break-inside-avoid">
            <button
              type="button"
              className="block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left"
              aria-label={`Open photo ${i + 1} of ${n}`}
              onClick={(e) => { opener.current = e.currentTarget; setOpen(i); }}
            >
              <Polaroid tilt={((i * 7) % 5) - 2} caption={p.caption}>
                <PlaceholderImage width={p.width} height={p.height} color={p.color} alt={p.alt} className="w-full" />
              </Polaroid>
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        aria-label="Photo viewer"
        className="m-auto max-h-[92dvh] w-[min(92vw,900px)] rounded-2xl border-0 bg-night p-4 text-milk backdrop:bg-black/80"
        onCancel={(e) => { e.preventDefault(); close(); }}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') show((open ?? 0) + 1); if (e.key === 'ArrowLeft') show((open ?? 0) - 1); }}
      >
        {current && open !== null && (
          <div className="flex flex-col items-center gap-3">
            <PlaceholderImage width={current.width} height={current.height} color={current.color} alt={current.alt} className="max-h-[70dvh] w-auto" />
            {current.caption && <p>{current.caption}</p>}
            <p aria-live="polite">{open + 1} / {n}</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => show(open - 1)} className="rounded-full border-2 border-milk px-5 py-2">Previous</button>
              <button type="button" onClick={() => show(open + 1)} className="rounded-full border-2 border-milk px-5 py-2">Next</button>
              <button type="button" onClick={close} className="rounded-full bg-milk px-5 py-2 text-cocoa">Close</button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
