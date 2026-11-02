import type { RuleRow } from '@backend/modules/messaging';
import { setRuleAction } from '../messaging-actions';
import { ActionForm } from '../ActionForm';

export function RuleList({ rules }: { rules: readonly RuleRow[] }) {
  return (
    <main className="grid gap-4">
      <h1 className="text-lg font-semibold">Notification rules</h1>
      <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>Which event sends which message to whom. Super admins only. WhatsApp rules stay off until a WhatsApp provider is configured; staff use the prefilled WhatsApp links meanwhile.</p>
      <ul className="grid gap-3">
        {rules.map((r) => (
          <li key={r.id} className="adm-card flex flex-wrap items-center justify-between gap-3">
            <span><strong>{r.event}</strong> · {r.channel}{r.templateKey ? ` · ${r.templateKey}` : ''} · to {r.recipient}</span>
            <ActionForm action={setRuleAction.bind(null, r.id, !r.enabled)} submitLabel={r.enabled ? 'Turn off' : 'Turn on'} className="grid"><span>{r.enabled ? 'On' : 'Off'}</span></ActionForm>
          </li>
        ))}
      </ul>
    </main>
  );
}
