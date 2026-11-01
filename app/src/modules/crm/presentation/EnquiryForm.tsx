'use client';

import Link from 'next/link';
import { useId, useState, type FormEvent } from 'react';
import { enquirySchema, fieldErrors, type SubmitOutcome } from '../application';

interface Props {
  submit: (input: unknown) => Promise<SubmitOutcome>;
  puppyName: string;
  defaultMessage: string;
  sourcePage: string;
  whatsappHref: string;
  consentVersion: string;
}

const input =
  'mt-1.5 h-12 w-full rounded-2xl border-2 border-cocoa/60 bg-milk px-4 text-base outline-none transition-[border-color,box-shadow] focus:border-cocoa focus:shadow-[0_0_0_4px_rgb(242_190_107/0.6)] aria-[invalid=true]:border-[#b3261e]';

/** Enquiry form on a puppy page (markup and classes follow the reference). */
export function EnquiryForm({ submit, puppyName, defaultMessage, sourcePage, whatsappHref, consentVersion }: Props) {
  const uid = useId();
  const [shownAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [note, setNote] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text = (k: string) => String(f.get(k) ?? '');
    const payload = { source: 'puppy', name: text('name'), phone: text('phone'), email: text('email'), area: text('area'), puppy: puppyName, message: text('message'), sourcePage, website: text('website'), shownAt };
    const check = enquirySchema.safeParse(payload);
    if (!check.success) { setErrors(fieldErrors(check.error)); return; }
    setErrors({}); setState('sending');
    try {
      const out = await submit(payload);
      if (out.ok) { setState('sent'); return; }
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
      <div role="status" className="tp-post__sent">
        <p className="font-plush mt-4 text-[2rem]">Message received!</p>
        <p className="mx-auto mt-2 max-w-[40ch] text-cocoa-soft">Thank you — our team will get back to you promptly. For the quickest reply, message us on WhatsApp.</p>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-6">WhatsApp us</a>
      </div>
    );
  }

  const label = 'block text-[0.95rem] font-semibold';
  const opt = <span className="font-normal text-cocoa-soft"> (optional)</span>;
  const err = (k: string) => (errors[k] ? <p id={`${uid}-${k}-err`} className="mt-1 text-sm font-semibold text-[#b3261e]">{errors[k]}</p> : null);
  const aria = (k: string, hint?: boolean) => ({ 'aria-invalid': errors[k] ? true : false, 'aria-describedby': errors[k] ? `${uid}-${k}-err` : hint ? `${uid}-${k}-hint` : undefined });
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className={label}>Your name<span className="text-toffee-ink"> *</span></label>
          <input id={`${uid}-name`} {...aria('name')} className={input} autoComplete="name" required minLength={2} maxLength={80} name="name" />{err('name')}
        </div>
        <div>
          <label htmlFor={`${uid}-phone`} className={label}>Phone or WhatsApp<span className="text-toffee-ink"> *</span></label>
          <input id={`${uid}-phone`} {...aria('phone', true)} className={input} type="tel" inputMode="tel" autoComplete="tel" required name="phone" />
          <p id={`${uid}-phone-hint`} className="mt-1 text-sm text-cocoa-soft">With country code, e.g. +971 50 123 4567</p>{err('phone')}
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className={label}>Email{opt}</label>
          <input id={`${uid}-email`} {...aria('email')} className={input} type="email" autoComplete="email" name="email" />{err('email')}
        </div>
        <div>
          <label htmlFor={`${uid}-area`} className={label}>Your area{opt}</label>
          <input id={`${uid}-area`} {...aria('area', true)} className={input} autoComplete="address-level2" maxLength={80} name="area" />
          <p id={`${uid}-area-hint`} className="mt-1 text-sm text-cocoa-soft">e.g. Dubai Marina</p>{err('area')}
        </div>
      </div>
      <div>
        <label htmlFor={`${uid}-message`} className={label}>Message {opt}</label>
        <textarea id={`${uid}-message`} name="message" rows={4} maxLength={2000} defaultValue={defaultMessage} className="mt-1.5 w-full rounded-2xl border-2 border-cocoa/60 bg-milk px-4 py-3 text-base outline-none focus:border-cocoa focus:shadow-[0_0_0_4px_rgb(242_190_107/0.6)]" />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" name="website" defaultValue="" /></label></div>
      <p data-consent="true" className="text-sm text-cocoa-soft">By sending this you confirm you are 18 or older and agree that we use your details to reply, as described in our <Link href="/privacy" className="link-ink">privacy notice</Link> (consent text {consentVersion}).</p>
      {state === 'error' && (
        <div role="alert" className="tp-letterform__alert"><p className="font-semibold">{note} Please try again, or message us on WhatsApp.</p></div>
      )}
      <button type="submit" disabled={state === 'sending'} className="btn btn-primary w-full disabled:opacity-70 sm:w-auto">{state === 'sending' ? 'Sending…' : 'Send enquiry'}</button>
    </form>
  );
}
