'use client';

import Link from 'next/link';
import { useId, useState, type FormEvent } from 'react';
import { paths } from '@nav';
import { Button, Card } from '@shared/ui';
import { enquirySchema, fieldErrors, type SubmitOutcome } from '../application';
import type { EnquirySource } from '../domain';

interface Props {
  source: EnquirySource;
  /** Server action that submits the enquiry. */
  submit: (input: unknown) => Promise<SubmitOutcome>;
  submitLabel: string;
  consentVersion: string;
  sourcePage: string;
  whatsappUrl: string;
  defaultMessage?: string;
  puppyOptions?: readonly string[];
  fixedPuppy?: string;
}

const field = 'mt-1 w-full rounded-xl border-2 border-cocoa bg-milk px-4 py-3 text-cocoa';
const inline = 'mx-1 inline-block w-44 max-w-full border-0 border-b-2 border-dashed border-cocoa bg-transparent px-1 text-cocoa';

export function EnquiryForm(p: Props) {
  const uid = useId();
  const [shownAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text = (k: string) => String(f.get(k) ?? '');
    const input = {
      source: p.source, name: text('name'), phone: text('phone'), email: text('email'), area: text('area'),
      puppy: p.fixedPuppy ?? text('puppy'), message: text('message'),
      marketing: f.get('marketing') === 'on', whatsappUpdates: f.get('whatsappUpdates') === 'on',
      sourcePage: p.sourcePage, website: text('website'), shownAt,
    };
    const check = enquirySchema.safeParse(input);
    if (!check.success) { setErrors(fieldErrors(check.error)); return; }
    setErrors({});
    setState('sending');
    try {
      const out = await p.submit(input);
      if (out.ok) { setReference(out.reference); setState('sent'); return; }
      if (out.code === 'validation') { setErrors(out.fields); setState('idle'); return; }
      setNote(out.code === 'rate-limited' ? `Lots of letters just now. Please try again in ${out.retryAfterSeconds} seconds.` : 'Something went wrong on our side.');
      setState('error');
    } catch {
      setNote('We could not reach the server.');
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <Card kind="form" className="animate-[post_0.5s_var(--ease-out-soft)]">
        <div role="status">
          <h3 className="text-3xl">Your letter is posted ♥</h3>
          <p className="mt-2">Thank you. We will reply soon, usually on WhatsApp. Reference {reference.slice(0, 8)}.</p>
        </div>
      </Card>
    );
  }

  const err = (k: string) => errors[k] ? <p id={`${uid}-${k}-e`} className="mt-1 text-sm font-semibold text-toffee-deep">{errors[k]}</p> : null;
  const a11y = (k: string) => ({ 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? `${uid}-${k}-e` : undefined });

  return (
    <Card kind="form">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {p.source === 'contact' ? (
          <div className="rounded-2xl bg-note p-5 text-lg leading-10 text-cocoa">
            <p className="font-[family-name:var(--font-hand)] text-xl">Dear TeddyPups,</p>
            <p>
              my name is <input aria-label="Your name" name="name" autoComplete="name" className={inline} {...a11y('name')} />, and you can reach me on{' '}
              <input aria-label="Phone or WhatsApp (with country code)" name="phone" type="tel" autoComplete="tel" placeholder="+971 50 123 4567" className={inline} {...a11y('phone')} /> or by email at{' '}
              <input aria-label="Email (optional)" name="email" type="email" autoComplete="email" className={inline} {...a11y('email')} />. I live in{' '}
              <input aria-label="Your area (optional)" name="area" placeholder="e.g. Dubai Marina" className={inline} {...a11y('area')} />, and I&apos;m curious about{' '}
              {p.puppyOptions && <select aria-label="Puppy you're interested in (optional)" name="puppy" className={inline}>{p.puppyOptions.map((o) => <option key={o}>{o}</option>)}</select>}.
            </p>
            {err('name')}{err('phone')}{err('email')}
          </div>
        ) : (
          <>
        <div><label htmlFor={`${uid}-name`} className="font-semibold text-cocoa">Your name</label><input id={`${uid}-name`} name="name" autoComplete="name" className={field} {...a11y('name')} />{err('name')}</div>
        <div><label htmlFor={`${uid}-phone`} className="font-semibold text-cocoa">Phone or WhatsApp</label><input id={`${uid}-phone`} name="phone" type="tel" autoComplete="tel" placeholder="+971 50 123 4567" className={field} {...a11y('phone')} />{err('phone')}</div>
        <div><label htmlFor={`${uid}-email`} className="font-semibold text-cocoa">Email (optional)</label><input id={`${uid}-email`} name="email" type="email" autoComplete="email" className={field} {...a11y('email')} />{err('email')}</div>
        <div><label htmlFor={`${uid}-area`} className="font-semibold text-cocoa">Area (optional)</label><input id={`${uid}-area`} name="area" className={field} {...a11y('area')} />{err('area')}</div>
        {p.puppyOptions && (
          <div><label htmlFor={`${uid}-puppy`} className="font-semibold text-cocoa">Interested in</label>
            <select id={`${uid}-puppy`} name="puppy" className={field}>{p.puppyOptions.map((o) => <option key={o}>{o}</option>)}</select></div>
        )}
          </>
        )}
        <div><label htmlFor={`${uid}-message`} className="font-semibold text-cocoa">Your message (optional)</label><textarea id={`${uid}-message`} name="message" rows={4} defaultValue={p.defaultMessage} className={field} {...a11y('message')} />{err('message')}</div>
        <div aria-hidden="true" className="absolute -left-[9999px]"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <fieldset className="m-0 border-0 p-0">
          <legend className="sr-only">Optional updates</legend>
          <label className="flex items-start gap-3"><input type="checkbox" name="whatsappUpdates" className="mt-1.5 size-5" /> <span>I would like WhatsApp updates about this puppy (optional).</span></label>
          <label className="mt-2 flex items-start gap-3"><input type="checkbox" name="marketing" className="mt-1.5 size-5" /> <span>I would like news about new puppies by email (optional).</span></label>
        </fieldset>
        {p.source === 'contact' && <p className="font-[family-name:var(--font-hand)] text-lg text-toffee-ink">with love, a future puppy parent</p>}
        <p className="text-sm">By sending this you confirm you are 18 or older and agree that we use your details to reply to you, as described in our <Link href={paths.privacy()} className="underline">privacy notice</Link>. Consent text {p.consentVersion}.</p>
        {state === 'error' && (
          <div role="alert" className="rounded-xl border-2 border-toffee-deep bg-honey-soft p-4">
            <p>{note} Please try again, or chat with us instead.</p>
            <div className="mt-3"><Button href={p.whatsappUrl} variant="whatsapp" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</Button></div>
          </div>
        )}
        <Button type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Posting…' : p.submitLabel}</Button>
      </form>
    </Card>
  );
}
