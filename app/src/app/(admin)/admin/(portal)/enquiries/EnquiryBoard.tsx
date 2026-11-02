import Link from 'next/link';
import { SOURCE_LABEL, STATUS_LABEL, type EnquiryRow, type EnquiryStatus, type StaffOption } from '@backend/modules/inbox';
import { adminPaths } from '@nav';
import { Board, BoardDnd, Drawer } from '@shared/ui/admin';
import { ActionForm } from '../ActionForm';
import { enquiryStatusAction, moveEnquiryAction } from '../inbox-actions';
import { ageLabel } from '../ageLabel';

const COLUMNS: { status: EnquiryStatus; next?: EnquiryStatus }[] = [{ status: 'new', next: 'contacted' }, { status: 'contacted', next: 'qualified' }, { status: 'qualified' }];

/** Enquiries still being worked, by status. Cards show who owns them and how old they are; one button moves them on. */
export function EnquiryBoard({ rows, staff, now }: { rows: readonly EnquiryRow[]; staff: readonly StaffOption[]; now: Date }) {
  const names = new Map(staff.map((s) => [s.userId, s.fullName]));
  return (
    <BoardDnd move={moveEnquiryAction}>
    <Board
      label="Enquiries by status"
      columns={COLUMNS.map(({ status, next }) => {
        const here = rows.filter((e) => e.status === status);
        return {
          id: status, title: STATUS_LABEL[status], count: here.length,
          children: here.map((e) => (
            <article key={e.id} className="adm-tile" aria-label={`Enquiry from ${e.name}`} data-card={e.id} draggable>
              <Link href={adminPaths.enquiry(e.id)} className="adm-link font-semibold">{e.name}</Link>
              <span className="adm-muted text-xs">{SOURCE_LABEL[e.source]}{e.puppyLabel ? ` · ${e.puppyLabel}` : ''}</span>
              <span className="text-xs">{ageLabel(e.createdAt, now)} · {e.assignedTo ? (names.get(e.assignedTo) ?? 'Assigned') : 'Unassigned'}</span>
              <Drawer label="Quick view" title={e.name}>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="adm-muted">Status</dt><dd>{STATUS_LABEL[e.status]}</dd></div>
                  <div><dt className="adm-muted">Source</dt><dd>{SOURCE_LABEL[e.source]}</dd></div>
                  <div><dt className="adm-muted">Phone</dt><dd>{e.phone ?? '—'}</dd></div>
                  <div><dt className="adm-muted">Email</dt><dd className="break-all">{e.email ?? '—'}</dd></div>
                  <div><dt className="adm-muted">Puppy</dt><dd>{e.puppyLabel ?? '—'}</dd></div>
                  <div><dt className="adm-muted">Owner</dt><dd>{e.assignedTo ? (names.get(e.assignedTo) ?? 'Assigned') : 'Unassigned'}</dd></div>
                </dl>
                <Link href={adminPaths.enquiry(e.id)} className="adm-btn justify-self-start">Open the enquiry</Link>
              </Drawer>
              {next ? (
                <ActionForm action={enquiryStatusAction.bind(null, e.id)} submitLabel={`Mark ${STATUS_LABEL[next].toLowerCase()}`} className="grid gap-1"><input type="hidden" name="status" value={next} /></ActionForm>
              ) : null}
            </article>
          )),
        };
      })}
    />
    </BoardDnd>
  );
}
