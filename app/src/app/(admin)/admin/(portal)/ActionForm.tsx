'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, type ReactNode } from 'react';
import type { FormState } from '../actions';
import { toast } from './shell/Toaster';

/** Generic form for portal actions: pending state, polite error and notice. `action` is a bound server action. */
export function ActionForm({ action, submitLabel, children, className = 'grid gap-4', encType, id }: { action: (prev: FormState, form: FormData) => Promise<FormState>; submitLabel?: string; children: ReactNode; className?: string; encType?: 'multipart/form-data'; id?: string }) {
  const [state, formAction, pending] = useActionState(action, {});
  const router = useRouter();
  // A successful change must show up in the surrounding server-rendered page (statuses, totals, lists).
  useEffect(() => {
    if (state.notice) { toast(state.notice); router.refresh(); }
  }, [state, router]);
  return (
    <form action={formAction} className={className} encType={encType} id={id}>
      {children}
      <p role="alert" aria-live="polite" className="adm-error min-h-5 text-sm">{state.error}</p>
      {submitLabel ? <button type="submit" className="adm-btn justify-self-start" disabled={pending}>{pending ? 'Please wait…' : submitLabel}</button> : null}
    </form>
  );
}

export function TextField({ name, label, defaultValue, type = 'text', required = true, hint }: { name: string; label: string; defaultValue?: string | number | null; type?: string; required?: boolean; hint?: string }) {
  return (
    <div className="grid gap-1">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue ?? ''} required={required} className="adm-input" />
      {hint ? <span className="text-xs" style={{ color: 'var(--adm-muted)' }}>{hint}</span> : null}
    </div>
  );
}

export function SelectField({ name, label, options, defaultValue }: { name: string; label: string; options: readonly { value: string; label: string }[]; defaultValue?: string }) {
  return (
    <div className="grid gap-1">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className="adm-input">
        {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </div>
  );
}

/** A button inside an ActionForm that sends `change=<value>` (status buttons, delete). */
export function ChangeButton({ value, children, danger }: { value: string; children: ReactNode; danger?: boolean }) {
  return (
    <button type="submit" name="change" value={value} className="adm-btn" style={danger ? { background: 'var(--adm-danger)' } : undefined}>{children}</button>
  );
}
