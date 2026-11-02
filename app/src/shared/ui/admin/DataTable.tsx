import type { ReactNode } from 'react';
import { ColumnChooser } from './ColumnChooser';

export interface Column<T> { readonly key: string; readonly header: string; readonly numeric?: boolean; readonly cell: (row: T) => ReactNode }

/** Plain, accessible table: caption, header cells with scope, tabular numbers and an empty state. */
export function DataTable<T>({ caption, columns, rows, rowKey, empty, id }: { caption: string; columns: readonly Column<T>[]; rows: readonly T[]; rowKey: (row: T) => string; empty: ReactNode; /** Gives the table a column chooser whose choice is remembered in this browser. */ id?: string }) {
  if (rows.length === 0) return <div className="adm-card text-sm">{empty}</div>;
  return (
    <div>
      {id ? <ColumnChooser tableId={id} columns={columns.map((c) => ({ key: c.key, header: c.header }))} /> : null}
    <div className="adm-table-wrap" role="region" aria-label={caption} tabIndex={0} id={id}>
      <table className="adm-table">
        <caption className="sr-only">{caption}</caption>
        <thead><tr>{columns.map((c) => (<th key={c.key} scope="col" data-col={c.key} className={c.numeric ? 'num' : undefined}>{c.header}</th>))}</tr></thead>
        <tbody>
          {rows.map((r) => (<tr key={rowKey(r)}>{columns.map((c) => (<td key={c.key} data-col={c.key} className={c.numeric ? 'num' : undefined}>{c.cell(r)}</td>))}</tr>))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
