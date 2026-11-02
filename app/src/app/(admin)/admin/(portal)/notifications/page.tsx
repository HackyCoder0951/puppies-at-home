import { messagingMessage } from '@backend/modules/messaging';
import { getMessaging } from '@composition';
import { NotificationList } from './NotificationList';

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number.parseInt((await searchParams).page ?? '1', 10) || 1);
  const result = await (await getMessaging()).notifications(page);
  if (!result.ok) return <p role="alert" className="adm-error">{messagingMessage(result.error)}</p>;
  return <NotificationList rows={result.value.rows} unread={result.value.unread} />;
}
