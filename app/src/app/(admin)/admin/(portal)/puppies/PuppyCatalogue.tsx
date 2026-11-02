import Link from 'next/link';
import type { PuppyAdminRow } from '@backend/modules/cms';
import { adminPaths } from '@nav';
import { Badge, DataTable, PageHeader, type Tone } from '@shared/ui/admin';
import { ChangeButton, ActionForm } from '../ActionForm';
import { puppyStatusAction } from '../actions';

const STATUS: Record<PuppyAdminRow['status'], { label: string; tone: Tone }> = { available: { label: 'Available', tone: 'success' }, reserved: { label: 'Reserved', tone: 'warning' }, gone_home: { label: 'Gone home', tone: 'neutral' } };
const FILTERS = [['', 'All'], ['available', 'Available'], ['reserved', 'Reserved'], ['gone_home', 'Gone home'], ['draft', 'Drafts']] as const;
const title = (p: PuppyAdminRow) => `${p.name ?? p.breed}${p.name ? ` (${p.breed})` : ''}`;

/** Catalogue as photo cards (default) or a table, with a status filter and an inline publish switch. */
export function PuppyCatalogue({ rows, filter, view }: { rows: readonly PuppyAdminRow[]; filter: string; view: 'grid' | 'table' }) {
  const shown = rows.filter((p) => (filter === 'draft' ? !p.publishedAt : filter ? p.status === filter : true));
  const href = (f: string, v = view) => `${adminPaths.puppies()}?${new URLSearchParams({ ...(f ? { filter: f } : {}), ...(v === 'table' ? { view: 'table' } : {}) })}`;
  const toggle = (p: PuppyAdminRow) => (
    <ActionForm action={puppyStatusAction.bind(null, p.id)} className="grid gap-1" submitLabel={undefined}>
      {p.publishedAt ? <ChangeButton value="unpublish">Unpublish</ChangeButton> : <ChangeButton value="publish">Publish</ChangeButton>}
    </ActionForm>
  );
  return (
    <main className="grid gap-4">
      <PageHeader
        title="Puppies" description={`${shown.length} of ${rows.length} shown.`}
        actions={<><Link href={href(filter, 'grid')} className={`adm-btn adm-btn-small ${view === 'grid' ? '' : 'adm-btn-secondary'}`}>Grid</Link><Link href={href(filter, 'table')} className={`adm-btn adm-btn-small ${view === 'table' ? '' : 'adm-btn-secondary'}`}>Table</Link><Link href={adminPaths.newPuppy()} className="adm-btn">Add a puppy</Link></>}
      />
      <nav aria-label="Status filter" className="adm-attention">{FILTERS.map(([v, label]) => (<Link key={v} href={href(v)} className="adm-chip" aria-current={filter === v ? 'page' : undefined}>{label}</Link>))}</nav>
      {view === 'table' ? (
        <DataTable
          id="puppies-table" caption="Puppies" rows={shown} rowKey={(p) => p.id} empty="No puppies match."
          columns={[
            { key: 'n', header: 'Puppy', cell: (p) => <Link href={adminPaths.puppy(p.id)} className="adm-link font-semibold">{title(p)}</Link> },
            { key: 's', header: 'Status', cell: (p) => <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge> },
            { key: 'a', header: 'Age', cell: (p) => p.ageText },
            { key: 'p', header: 'Site', cell: (p) => (p.publishedAt ? 'Published' : 'Draft') },
            { key: 'x', header: 'Publish', cell: toggle },
          ]}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {shown.map((p) => (
            <li key={p.id} className="adm-card grid gap-2 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.coverUrl ? <img src={p.coverUrl} alt="" className="aspect-square w-full rounded-lg object-cover" /> : <div className="aspect-square w-full rounded-lg" style={{ background: 'var(--surface-2)' }} />}
              <Link href={adminPaths.puppy(p.id)} className="adm-link font-semibold">{title(p)}</Link>
              <span className="flex flex-wrap items-center gap-2 text-sm"><Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge><span className="adm-muted">{p.ageText}</span></span>
              {toggle(p)}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
