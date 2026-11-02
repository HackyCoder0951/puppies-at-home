import { messagingMessage } from '@backend/modules/messaging';
import { getMessaging } from '@composition';
import { TemplateEditor } from './TemplateEditor';

export default async function TemplatesPage() {
  const messaging = await getMessaging();
  const result = await messaging.templates();
  if (!result.ok) return <p role="alert" className="adm-error">{messagingMessage(result.error)}</p>;
  return (
    <main className="grid gap-4">
      <h1 className="text-lg font-semibold">Message templates</h1>
      <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>Saving creates a new version and activates it; older versions stay and can be restored. Only listed variables work. Editing needs the template permission.</p>
      {result.value.map((group) => (<TemplateEditor key={`${group.key}:${group.channel}`} group={group} preview={messaging.preview} />))}
    </main>
  );
}
