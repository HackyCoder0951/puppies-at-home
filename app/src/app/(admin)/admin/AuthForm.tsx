'use client';

import { useActionState, type ReactNode } from 'react';
import { confirmTotpAction, disableTotpAction, requestResetAction, resetPasswordAction, signInAction, verifyTotpAction, type FormState } from './actions';

function Shell({ state, pending, submitLabel, action, children }: { state: FormState; pending: boolean; submitLabel: string; action: (form: FormData) => void; children: ReactNode }) {
  return (
    <form action={action} className="adm-card grid gap-4" noValidate>
      {children}
      <p role="alert" aria-live="polite" className="adm-error min-h-5 text-sm">{state.error}</p>
      {state.notice ? <p role="status" className="text-sm">{state.notice}</p> : null}
      <button type="submit" className="adm-btn" disabled={pending}>{pending ? 'Please wait…' : submitLabel}</button>
    </form>
  );
}

function Field({ id, label, type = 'text', autoComplete, defaultValue }: { id: string; label: string; type?: string; autoComplete?: string; defaultValue?: string }) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} name={id} type={type} autoComplete={autoComplete} defaultValue={defaultValue} required className="adm-input" />
    </div>
  );
}

/** The email is echoed back by the action so a failed submit does not clear it (React resets forms after an action). */
export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signInAction, {});
  return (
    <Shell state={state} pending={pending} submitLabel="Sign in" action={action}>
      <input type="hidden" name="next" value={next} />
      <Field id="email" label="Email" type="email" autoComplete="username" defaultValue={state.email} />
      <Field id="password" label="Password" type="password" autoComplete="current-password" />
    </Shell>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestResetAction, {});
  return (
    <Shell state={state} pending={pending} submitLabel="Send reset link" action={action}>
      <Field id="email" label="Email" type="email" autoComplete="username" defaultValue={state.email} />
    </Shell>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, {});
  return (
    <Shell state={state} pending={pending} submitLabel="Set new password" action={action}>
      <Field id="password" label="New password (at least 12 characters)" type="password" autoComplete="new-password" />
      <Field id="confirm" label="Repeat the new password" type="password" autoComplete="new-password" />
    </Shell>
  );
}

function CodeField({ label = 'Six-digit code' }: { label?: string }) {
  return (
    <div className="grid gap-1">
      <label htmlFor="code" className="text-sm font-medium">{label}</label>
      <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required className="adm-input" />
    </div>
  );
}

export function VerifyForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(verifyTotpAction, {});
  return (
    <Shell state={state} pending={pending} submitLabel="Verify" action={action}>
      <input type="hidden" name="next" value={next} />
      <CodeField label="Code from your authenticator app" />
    </Shell>
  );
}

export function ConfirmTotpForm({ factorId }: { factorId: string }) {
  const [state, action, pending] = useActionState(confirmTotpAction.bind(null, factorId), {});
  return (
    <Shell state={state} pending={pending} submitLabel="Confirm and turn on" action={action}>
      <CodeField label="Enter the code the app shows" />
    </Shell>
  );
}

export function DisableTotpForm() {
  const [state, action, pending] = useActionState(disableTotpAction, {});
  return (
    <Shell state={state} pending={pending} submitLabel="Turn off the authenticator" action={action}>
      <CodeField label="Current code (needed to turn it off)" />
    </Shell>
  );
}
