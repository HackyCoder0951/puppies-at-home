import Link from 'next/link';
import { PAGE_SIZE, type CustomerRow } from '@backend/modules/inbox';
import { adminPaths } from '@nav';
import { DataTable, PageHeader } from '@shared/ui/admin';
import { ListControls } from '../ListControls';

export function CustomerList({ rows, total, page, q }: { rows: readonly CustomerRow[]; total: number; page: number; q?: string }) {
  return (
    <main className="grid gap-4">
      <PageHeader title="Customers" description={`${total} people and families.`} />
      <ListControls action={adminPaths.customers()} q={q} page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} hrefFor={(p) => adminPaths.customers({ q, page: p })} />
      <DataTable
        caption="Customers" rows={rows} rowKey={(c) => c.id} empty="No customers match."
        columns={[
          { key: 'name', header: 'Name', cell: (c) => <Link href={adminPaths.customer(c.id)} className="adm-link font-semibold">{c.fullName}</Link> },
          { key: 'phone', header: 'Phone', cell: (c) => c.phone ?? '—' },
          { key: 'email', header: 'Email', cell: (c) => c.email ?? '—' },
          { key: 'area', header: 'Area', cell: (c) => c.area ?? '—' },
          { key: 'since', header: 'Customer since', cell: (c) => new Date(c.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) },
        ]}
      />
    </main>
  );
}
