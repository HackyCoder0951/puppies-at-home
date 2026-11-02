'use client';

import { useActionState, type ReactNode } from 'react';
import { requestResetAction, resetPasswordAction, signInAction, type FormState } from './actions';

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
