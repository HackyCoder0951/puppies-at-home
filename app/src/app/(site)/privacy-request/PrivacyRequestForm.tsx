'use client';

import { useActionState, useState } from 'react';
import { privacyRequestAction } from './action';

const TYPES = [
  ['access', 'A copy of the information you hold about me'], ['rectification', 'Correct something that is wrong'], ['erasure', 'Delete my information'],
  ['restriction', 'Stop using my information for now'], ['portability', 'My information in a file I can reuse'], ['objection', 'I object to how my information is used'],
  ['withdrawal', 'Withdraw a consent I gave'], ['grievance', 'Make a complaint'],
] as const;

const field = { display: 'grid', gap: 4 } as const;
const input = { border: '1px solid var(--color-cocoa-soft)', borderRadius: 10, padding: '10px 12px', background: 'var(--color-milk)', color: 'var(--color-cocoa)', font: 'inherit' } as const;

/** Plain form for the public privacy request; a hidden field records when it was opened (bots send it instantly). */
export function PrivacyRequestForm() {
  const [state, action, pending] = useActionState(privacyRequestAction, {});
  const [startedAt] = useState(() => Date.now());
  if (state.done) return <p role="status" className="text-lede">Thank you. We have your request and will reply within 3 days. We may ask you to confirm it is really you before we share or change anything.</p>;
  return (
    <form action={action} style={{ display: 'grid', gap: 16, maxWidth: 560, position: 'relative', zIndex: 2, marginBottom: 96 }}>
      <input type="hidden" name="startedAt" value={startedAt} />
      <div style={{ position: 'absolute', left: -9999 }} aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label style={field}>Your name<input name="name" required maxLength={120} autoComplete="name" style={input} /></label>
      <label style={field}>Email or phone number we can reach you on<input name="contact" required maxLength={200} autoComplete="email" style={input} /></label>
      <label style={field}>What would you like?
        <select name="type" required defaultValue="access" style={input}>{TYPES.map(([value, label]) => (<option key={value} value={value}>{label}</option>))}</select>
      </label>
      <label style={field}>Anything else we should know (optional)<textarea name="details" rows={4} maxLength={2000} style={input} /></label>
      <p role="alert" aria-live="polite" style={{ color: '#b3261e', minHeight: 20 }}>{state.error}</p>
      <button type="submit" className="btn-primary" disabled={pending} style={{ justifySelf: 'start' }}>{pending ? 'Sending…' : 'Send my request'}</button>
    </form>
  );
}
