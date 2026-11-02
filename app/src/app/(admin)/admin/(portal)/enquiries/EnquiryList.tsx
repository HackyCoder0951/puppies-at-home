import Link from 'next/link';
import { ENQUIRY_STATUSES, PAGE_SIZE, SOURCE_LABEL, STATUS_LABEL, type EnquiryRow, type StaffOption } from '@backend/modules/inbox';
import { adminPaths } from '@nav';
import { ListControls } from '../ListControls';

export function EnquiryList({ rows, total, page, status, q, staff }: { rows: readonly EnquiryRow[]; total: number; page: number; status?: string; q?: string; staff: readonly StaffOption[] }) {
  const names = new Map(staff.map((s) => [s.userId, s.fullName]));
  return (
    <main className="grid gap-4">
      <h1 className="text-lg font-semibold">Enquiries <span className="text-sm font-normal" style={{ color: 'var(--adm-muted)' }}>({total})</span></h1>
      <ListControls
        action={adminPaths.enquiries()}
        q={q}
        page={page}
        pages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        hrefFor={(p) => adminPaths.enquiries({ status, q, page: p })}
        filters={
          <div className="grid gap-1">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <select id="status" name="status" defaultValue={status ?? ''} className="adm-input">
              <option value="">All</option>
              {ENQUIRY_STATUSES.map((s) => (<option key={s} value={s}>{STATUS_LABEL[s]}</option>))}
            </select>
          </div>
        }
      />
      {rows.length === 0 ? <p className="adm-card text-sm">No enquiries match.</p> : null}
      <ul className="grid gap-3">
        {rows.map((e) => (
          <li key={e.id} className="adm-card grid gap-1">
            <Link href={adminPaths.enquiry(e.id)} className="adm-link font-medium">{e.name}</Link>
            <span className="text-sm" style={{ color: 'var(--adm-muted)' }}>
              {STATUS_LABEL[e.status]} · {SOURCE_LABEL[e.source]}{e.puppyLabel ? ` · ${e.puppyLabel}` : ''} · {new Date(e.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              {e.assignedTo ? ` · ${names.get(e.assignedTo) ?? 'Assigned'}` : ' · Unassigned'}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
