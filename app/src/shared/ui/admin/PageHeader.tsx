import type { ReactNode } from 'react';

/** Title (brand serif), one-line description and the page's actions (one primary, the rest secondary). */
export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="adm-pageheader">
      <div className="grid gap-1">
        <h1 className="adm-title">{title}</h1>
        {description ? <p className="adm-muted text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
