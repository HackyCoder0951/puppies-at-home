'use client';

import { useRouter } from 'next/navigation';
import { useState, type DragEvent, type ReactNode } from 'react';

export interface MoveResult { readonly ok: boolean; readonly message: string }

/**
 * Drag a card (`[data-card]`) onto another column (`[data-column]`) to move it. The move is a server action, so the
 * database still decides whether it is allowed; every card also has a button for keyboard and touch use.
 */
export function BoardDnd({ children, move }: { children: ReactNode; move: (id: string, to: string) => Promise<MoveResult> }) {
  const router = useRouter();
  const [over, setOver] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const column = (e: DragEvent) => (e.target as HTMLElement).closest<HTMLElement>('[data-column]');
  return (
    <div
      onDragStart={(e) => { const card = (e.target as HTMLElement).closest<HTMLElement>('[data-card]'); if (card) { e.dataTransfer.setData('text/plain', card.dataset.card ?? ''); e.dataTransfer.effectAllowed = 'move'; } }}
      onDragOver={(e) => { const col = column(e); if (col) { e.preventDefault(); setOver(col.dataset.column ?? null); } }}
      onDragLeave={() => setOver(null)}
      onDrop={async (e) => {
        const col = column(e);
        const id = e.dataTransfer.getData('text/plain');
        setOver(null);
        if (!col || !id) return;
        e.preventDefault();
        const result = await move(id, col.dataset.column ?? '');
        setStatus(result.message);
        if (result.ok) router.refresh();
      }}
      data-over={over ?? undefined}
      className="min-w-0"
    >
      {children}
      <p role="status" aria-live="polite" className="sr-only">{status}</p>
    </div>
  );
}
