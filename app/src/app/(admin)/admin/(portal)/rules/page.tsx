import { messagingMessage } from '@backend/modules/messaging';
import { getMessaging } from '@composition';
import { RuleList } from './RuleList';

export default async function RulesPage() {
  const result = await (await getMessaging()).rules();
  if (!result.ok) return <p role="alert" className="adm-error">{messagingMessage(result.error)}</p>;
  return <RuleList rules={result.value} />;
}
