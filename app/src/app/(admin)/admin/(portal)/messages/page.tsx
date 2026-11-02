import { messagingMessage } from '@backend/modules/messaging';
import { getMessaging } from '@composition';
import { MessageLog } from './MessageLog';

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const result = await (await getMessaging()).messages(sp.status, page);
  if (!result.ok) return <p role="alert" className="adm-error">{messagingMessage(result.error)}</p>;
  return <MessageLog rows={result.value.rows} total={result.value.total} page={page} status={sp.status} />;
}
