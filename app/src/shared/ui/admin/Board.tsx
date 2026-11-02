import type { ReactNode } from 'react';

export interface BoardColumn { readonly id: string; readonly title: string; readonly count: number; readonly children: ReactNode }

/** Kanban-style columns. Moving between columns is done with explicit buttons on each card (keyboard friendly). */
export function Board({ label, columns }: { label: string; columns: readonly BoardColumn[] }) {
  return (
    <div className="adm-board" role="group" aria-label={label} tabIndex={0}>
      {columns.map((c) => (
        <section key={c.id} className="adm-col" aria-label={`${c.title}, ${c.count}`}>
          <h3><span>{c.title}</span><span className="adm-muted">{c.count}</span></h3>
          {c.count === 0 ? <p className="adm-muted px-1 text-xs">Nothing here.</p> : c.children}
        </section>
      ))}
    </div>
  );
}
