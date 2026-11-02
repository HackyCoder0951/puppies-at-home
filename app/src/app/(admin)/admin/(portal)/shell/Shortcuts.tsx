'use client';

import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useRef, useState } from 'react';

const JUMPS: Record<string, [string, string]> = {
  h: ['/admin', 'Overview'], e: ['/admin/enquiries', 'Enquiries'], c: ['/admin/customers', 'Customers'], o: ['/admin/orders', 'Orders'], d: ['/admin/deliveries', 'Deliveries'],
  i: ['/admin/invoices', 'Invoices'], p: ['/admin/payments', 'Payments'], u: ['/admin/puppies', 'Puppies'], m: ['/admin/messages', 'Messages'],
};

const typing = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/** Keyboard help: `g` then a letter jumps to a section, `/` focuses the search box, `?` lists the shortcuts. Ignored while typing. */
export function Shortcuts() {
  const router = useRouter();
  const help = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onKey = (e: KeyboardEvent) => {
      if (typing(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (pending) {
        const target = JUMPS[e.key.toLowerCase()];
        setPending(false);
        if (target) { e.preventDefault(); router.push(target[0]); }
        return;
      }
      if (e.key === 'g') { setPending(true); clearTimeout(timer); timer = setTimeout(() => setPending(false), 1200); }
      else if (e.key === '/') { const q = document.getElementById('q'); if (q) { e.preventDefault(); q.focus(); } }
      else if (e.key === '?') { e.preventDefault(); help.current?.showModal(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(timer); };
  }, [pending, router]);
  return (
    <dialog ref={help} className="adm-palette" aria-label="Keyboard shortcuts">
      <div className="grid gap-3 p-5">
        <h2 className="font-semibold">Keyboard shortcuts</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt><kbd>Ctrl K</kbd></dt><dd>Search and jump</dd>
          <dt><kbd>/</kbd></dt><dd>Focus the search box on a list</dd>
          {Object.entries(JUMPS).map(([k, [, label]]) => (<Fragment key={k}><dt><kbd>g</kbd> <kbd>{k}</kbd></dt><dd>Go to {label}</dd></Fragment>))}
        </dl>
        <form method="dialog"><button className="adm-btn adm-btn-secondary adm-btn-small">Close</button></form>
      </div>
    </dialog>
  );
}
