import { ENQUIRY_STATUSES, inboxMessage, type EnquiryStatus } from '@backend/modules/inbox';
import { getInbox } from '@composition';
import { EnquiryList } from './EnquiryList';

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const sp = await searchParams;
  const status = ENQUIRY_STATUSES.find((s) => s === sp.status) as EnquiryStatus | undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const inbox = await getInbox();
  const [list, staff] = await Promise.all([inbox.listEnquiries({ status, search: sp.q, page }), inbox.listStaff()]);
  if (!list.ok) return <p role="alert" className="adm-error">{inboxMessage(list.error)}</p>;
  return <EnquiryList rows={list.value.rows} total={list.value.total} page={page} status={status} q={sp.q} staff={staff.ok ? staff.value : []} />;
}
