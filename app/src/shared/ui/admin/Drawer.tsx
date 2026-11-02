'use client';

import { useRef, type ReactNode } from 'react';

/** Right-hand drawer for a quick look at a record without leaving the list. Native dialog: focus trap and Escape included. */
export function Drawer({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="adm-btn adm-btn-secondary adm-btn-small" onClick={() => ref.current?.showModal()} aria-haspopup="dialog">{label}</button>
      <dialog ref={ref} className="adm-drawer" aria-label={title} onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
        <div className="grid gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="adm-title" style={{ fontSize: 20 }}>{title}</h2>
            <form method="dialog"><button className="adm-btn adm-btn-secondary adm-btn-small" aria-label="Close">Close</button></form>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
