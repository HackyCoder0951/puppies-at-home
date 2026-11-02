import { TEMPLATE_VARIABLES, type StaffMessaging, type TemplateGroup } from '@backend/modules/messaging';
import { activateVersionAction, saveTemplateAction } from '../messaging-actions';
import { ActionForm, SelectField, TextField } from '../ActionForm';

export function TemplateEditor({ group, preview }: { group: TemplateGroup; preview: StaffMessaging['preview'] }) {
  const active = group.versions.find((v) => v.isActive) ?? group.versions[0];
  if (!active) return null;
  const sample = preview(active.subject ?? '', active.body);
  return (
    <details className="adm-card grid gap-3">
      <summary className="cursor-pointer font-medium">{group.key} <span className="text-sm font-normal" style={{ color: 'var(--adm-muted)' }}>({group.channel}, version {active.version})</span></summary>
      <ActionForm action={saveTemplateAction.bind(null, group.key, group.channel)} submitLabel="Save as a new version" className="mt-3 grid gap-3">
        {group.channel === 'email' ? <TextField name="subject" label="Subject" defaultValue={active.subject} required={false} /> : <input type="hidden" name="subject" value="" />}
        <div className="grid gap-1">
          <label htmlFor={`body-${group.key}-${group.channel}`} className="text-sm font-medium">Body</label>
          <textarea id={`body-${group.key}-${group.channel}`} name="body" defaultValue={active.body} rows={7} maxLength={4000} required className="adm-input" />
        </div>
      </ActionForm>
      <p className="text-xs" style={{ color: 'var(--adm-muted)' }}>Variables: {TEMPLATE_VARIABLES.map((v) => `{{${v}}}`).join(' ')}</p>
      <section aria-label="Preview with sample data" className="text-sm">
        <strong>Preview with sample data</strong>
        {sample.subject ? <p>Subject: {sample.subject}</p> : null}
        <pre className="whitespace-pre-wrap">{sample.body}</pre>
      </section>
      {group.versions.length > 1 ? (
        <ActionForm action={activateVersionAction.bind(null, group.key, group.channel)} submitLabel="Restore this version" className="grid gap-3 sm:grid-cols-2">
          <SelectField name="version" label="Version" defaultValue={String(active.version)} options={group.versions.map((v) => ({ value: String(v.version), label: `Version ${v.version}${v.isActive ? ' (active)' : ''}, ${new Date(v.createdAt).toLocaleDateString('en-GB')}` }))} />
        </ActionForm>
      ) : null}
    </details>
  );
}
