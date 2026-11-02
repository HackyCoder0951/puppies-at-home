import { notFound } from 'next/navigation';
import { inboxMessage } from '@backend/modules/inbox';
import { getInbox, getMessaging } from '@composition';
import { EnquiryView } from '../EnquiryView';

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const inbox = await getInbox();
  const [detail, staff, templates] = await Promise.all([params.then(({ id }) => inbox.getEnquiry(id)), inbox.listStaff(), getMessaging().then((m) => m.templates())]);
  if (!detail.ok) {
    if (detail.error.code === 'not-found') notFound();
    return <p role="alert" className="adm-error">{inboxMessage(detail.error)}</p>;
  }
  return <EnquiryView enquiry={detail.value} staff={staff.ok ? staff.value : []} templates={templates.ok ? templates.value : []} />;
}
