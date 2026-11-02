'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface Toast { id: number; text: string; tone: 'success' | 'error' }
const EVENT = 'adm-toast';

/** Fires a toast from anywhere on the client (used by the shared form component). */
export function toast(text: string, tone: Toast['tone'] = 'success') {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { text, tone } }));
}

/** Makes the one kind of link a toast may carry (a WhatsApp chat or a payment link) clickable. */
function withLink(text: string): ReactNode {
  const m = /^(.*?)(https:\/\/\S+)$/.exec(text);
  if (!m) return text;
  const url = m[2] ?? '';
  return (<>{m[1]}<a href={url} target="_blank" rel="noopener noreferrer" className="adm-link break-all">{url.startsWith('https://wa.me/') ? 'Open WhatsApp' : url}</a></>);
}

/** Polite live region in the corner. Messages with a link stay until dismissed; others fade after six seconds. */
export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    let n = 0;
    const onToast = (e: Event) => {
      const { text, tone } = (e as CustomEvent<{ text: string; tone: Toast['tone'] }>).detail;
      const id = ++n;
      setItems((list) => [...list.slice(-3), { id, text, tone }]);
      if (!/https:\/\//.test(text)) setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 6000);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);
  return (
    <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-50 grid max-w-sm gap-2">
      {items.map((t) => (
        <div key={t.id} className="adm-card flex items-start justify-between gap-3 p-3 text-sm" style={{ boxShadow: 'var(--shadow)', borderColor: t.tone === 'success' ? 'var(--success)' : 'var(--danger)' }}>
          <span>{withLink(t.text)}</span>
          <button type="button" onClick={() => setItems((l) => l.filter((x) => x.id !== t.id))} className="adm-muted" aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  );
}
