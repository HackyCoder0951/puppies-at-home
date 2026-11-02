import type { StaffRow } from '@backend/modules/identity';
import { inviteStaffAction, updateStaffAction } from '../users-actions';
import { ActionForm, SelectField, TextField } from '../ActionForm';

const ROLES = [{ value: 'operator', label: 'Operator' }, { value: 'super_admin', label: 'Super admin' }];

export function StaffList({ rows, self }: { rows: readonly StaffRow[]; self: string }) {
  return (
    <main className="grid gap-4">
      <h1 className="text-lg font-semibold">Staff</h1>
      {rows.map((r) => (
        <article key={r.userId} className="adm-card grid gap-2" aria-label={r.fullName}>
          <h2 className="font-medium">{r.fullName}{r.userId === self ? ' (you)' : ''}{r.disabled ? ' · disabled' : ''}</h2>
          <ActionForm action={updateStaffAction.bind(null, r.userId)} submitLabel="Save" className="grid gap-3 sm:grid-cols-2">
            <SelectField name="role" label="Role" defaultValue={r.role} options={ROLES} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="mfa" defaultChecked={r.mfaRequired} /> Must use an authenticator app</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="disabled" defaultChecked={r.disabled} /> Disabled (cannot sign in)</label>
          </ActionForm>
        </article>
      ))}
      <section className="adm-card grid gap-3" aria-labelledby="invite">
        <h2 id="invite" className="font-medium">Invite a staff member</h2>
        <ActionForm action={inviteStaffAction} submitLabel="Send invitation" className="grid gap-3 sm:grid-cols-2">
          <TextField name="fullName" label="Full name" />
          <TextField name="email" label="Work email" type="email" />
          <SelectField name="role" label="Role" options={ROLES} />
        </ActionForm>
      </section>
    </main>
  );
}
