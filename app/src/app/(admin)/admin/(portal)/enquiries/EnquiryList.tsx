import Link from 'next/link';
import { ENQUIRY_STATUSES, PAGE_SIZE, SOURCE_LABEL, STATUS_LABEL, type EnquiryRow, type StaffOption } from '@backend/modules/inbox';
import { adminPaths } from '@nav';
import { Badge, DataTable, PageHeader } from '@shared/ui/admin';
import { ageLabel } from '../ageLabel';
import { ListControls } from '../ListControls';
import { SavedViews } from '../shell/SavedViews';
import { EnquiryBoard } from './EnquiryBoard';
import { ENQUIRY_TONE } from './enquiryTone';

/** Enquiries: board first (open ones by status), table for search and history. */
export function EnquiryList({ rows, total, page, status, q, staff, view, now }: { rows: readonly EnquiryRow[]; total: number; page: number; status?: string; q?: string; staff: readonly StaffOption[]; view: 'board' | 'table'; now: Date }) {
  const names = new Map(staff.map((s) => [s.userId, s.fullName]));
  const tab = (v: 'board' | 'table', label: string) => (
    <Link href={v === 'board' ? adminPaths.enquiries() : `${adminPaths.enquiries()}?view=table`} className={`adm-btn adm-btn-small ${view === v ? '' : 'adm-btn-secondary'}`} aria-current={view === v ? 'page' : undefined}>{label}</Link>
  );
  return (
    <main className="grid gap-4">
      <PageHeader title="Enquiries" description={view === 'board' ? `${rows.length} open enquiries.` : `${total} enquiries`} actions={<>{tab('board', 'Board')}{tab('table', 'Table')}</>} />
      {view === 'board' ? <EnquiryBoard rows={rows} staff={staff} now={now} /> : (
        <>
          <ListControls
            action={adminPaths.enquiries()} hidden={{ view: 'table' }} q={q} page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
            hrefFor={(p) => `${adminPaths.enquiries({ status, q, page: p })}${adminPaths.enquiries({ status, q, page: p }).includes('?') ? '&' : '?'}view=table`}
            filters={(
              <div className="grid gap-1">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select id="status" name="status" defaultValue={status ?? ''} className="adm-input"><option value="">All</option>{ENQUIRY_STATUSES.map((s) => (<option key={s} value={s}>{STATUS_LABEL[s]}</option>))}</select>
              </div>
            )}
          />
          <SavedViews listKey="enquiries" />
          <DataTable
            caption="Enquiries" rows={rows} rowKey={(e) => e.id} empty="No enquiries match."
            columns={[
              { key: 'name', header: 'Name', cell: (e) => <Link href={adminPaths.enquiry(e.id)} className="adm-link font-semibold">{e.name}</Link> },
              { key: 'status', header: 'Status', cell: (e) => <Badge tone={ENQUIRY_TONE[e.status]}>{STATUS_LABEL[e.status]}</Badge> },
              { key: 'source', header: 'Source', cell: (e) => SOURCE_LABEL[e.source] },
              { key: 'puppy', header: 'Puppy', cell: (e) => e.puppyLabel ?? '—' },
              { key: 'owner', header: 'Owner', cell: (e) => (e.assignedTo ? (names.get(e.assignedTo) ?? 'Assigned') : 'Unassigned') },
              { key: 'age', header: 'Received', cell: (e) => ageLabel(e.createdAt, now) },
            ]}
          />
        </>
      )}
    </main>
  );
}
