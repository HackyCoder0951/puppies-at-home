'use client';
/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';
import type React from 'react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { enquirySchema, fieldErrors, type SubmitOutcome } from '../application';

interface Props {
  /** Options for the "curious about" select; the first one is the "any puppy" choice. */
  puppyOptions: readonly string[];
  submit: (input: unknown) => Promise<SubmitOutcome>;
  whatsappHref: string;
  consentVersion: string;
}

const SENT = { heading: 'Message received!', body: 'Thank you — our team will get back to you promptly. For the quickest reply, message us on WhatsApp.' };

function Blank({ name, label, error, size, ...rest }: { name: string; label: string; error?: string; size: number } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className="tp-blank" style={{ '--size': `${size}ch` } as React.CSSProperties}>
      <input name={name} aria-label={label} aria-invalid={error ? true : undefined} aria-describedby={error ? `${name}-err` : undefined} {...rest} />
    </span>
  );
}

/** The contact letter: fill-in-the-blanks form, then envelope and postbox animation, then a thank-you note. */
export function LetterForm({ puppyOptions, submit, whatsappHref, consentVersion }: Props) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const [shownAt] = useState(() => Date.now());
  const [phase, setPhase] = useState<'writing' | 'sealing' | 'posting' | 'sent'>('writing');
  const [minH, setMinH] = useState<number>();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!ok) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = reduced
      ? [setTimeout(() => setPhase('sent'), 0)]
      : [setTimeout(() => { setMinH(root.current?.offsetHeight); setPhase('sealing'); }, 0), setTimeout(() => setPhase('posting'), 750), setTimeout(() => { setMinH(undefined); setPhase('sent'); }, 1750)];
    return () => t.forEach(clearTimeout);
  }, [ok]);

  useEffect(() => {
    if (phase === 'sent') sentRef.current?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => {
    if (Object.keys(errors).length) formRef.current?.querySelector<HTMLElement>('[aria-invalid=true]')?.focus();
  }, [errors]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text = (k: string) => String(f.get(k) ?? '');
    const puppy = text('puppy');
    const input = {
      source: 'contact', name: text('name'), phone: text('phone'), email: text('email'), area: text('area'),
      puppy: puppy === puppyOptions[0] ? '' : puppy, message: text('message'), sourcePage: '/contact', website: text('website'), shownAt,
    };
    const check = enquirySchema.safeParse(input);
    if (!check.success) { setErrors(fieldErrors(check.error)); setMessage('Please check the highlighted parts of your letter.'); return; }
    setErrors({}); setMessage(undefined); setPending(true);
    try {
      const out = await submit(input);
      if (out.ok) { setOk(true); return; }
      if (out.code === 'validation') { setErrors(out.fields); setMessage('Please check the highlighted parts of your letter.'); }
      else setMessage(out.code === 'rate-limited' ? `Lots of letters just now. Please try again in ${out.retryAfterSeconds} seconds.` : 'Something went wrong on our side. Please try again, or message us on WhatsApp.');
    } catch {
      setMessage('We could not reach the server. Please try again, or message us on WhatsApp.');
    } finally {
      setPending(false);
    }
  }

  const list = Object.entries(errors).filter(([k]) => k !== 'website');
  return (
    <div ref={root} className="tp-post" data-phase={phase} style={{ minHeight: minH }}>
      {phase !== 'sent' && (
        <form ref={formRef} onSubmit={onSubmit} noValidate className="tp-letterform" aria-hidden={phase !== 'writing' || undefined} inert={phase !== 'writing'}>
          <span aria-hidden="true" className="tp-letter__stamp"><svg viewBox="0 0 64 64" className="size-9" aria-hidden="true" fill="currentColor"><path d="M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5zM19.28 26.71C21.07 30.08 20.42 33.92 17.84 35.29C15.25 36.67 11.71 35.05 9.92 31.69C8.13 28.32 8.78 24.48 11.36 23.11C13.95 21.73 17.49 23.35 19.28 26.71ZM29.62 15.64C30.32 19.62 28.46 23.26 25.47 23.79C22.48 24.32 19.48 21.53 18.78 17.56C18.08 13.58 19.94 9.94 22.93 9.41C25.92 8.88 28.92 11.67 29.62 15.64ZM45.22 17.56C44.52 21.53 41.52 24.32 38.53 23.79C35.54 23.26 33.68 19.62 34.38 15.64C35.08 11.67 38.08 8.88 41.07 9.41C44.06 9.94 45.92 13.58 45.22 17.56ZM54.08 31.69C52.29 35.05 48.75 36.67 46.16 35.29C43.58 33.92 42.93 30.08 44.72 26.71C46.51 23.35 50.05 21.73 52.64 23.11C55.22 24.48 55.87 28.32 54.08 31.69Z"></path></svg></span>
          <p className="font-scrawl tp-letterform__greeting">Dear TeddyPups,</p>
          {message && !ok && (
            <div role="alert" className="tp-letterform__alert">
              <p className="font-semibold">{message}</p>
              {list.length > 0 && <ul>{list.map(([k, v]) => <li key={k} id={`${k}-err`}>{v}</li>)}</ul>}
            </div>
          )}
          <p className="tp-letterform__line">
            my name is <Blank name="name" label="Your name (required)" autoComplete="name" required minLength={2} maxLength={80} size={16} error={errors.name} />, and you can reach me on{' '}
            <Blank name="phone" label="Phone or WhatsApp number with country code (required)" type="tel" inputMode="tel" autoComplete="tel" required size={15} placeholder="+971 50 123 4567" error={errors.phone} /> or by email at{' '}
            <Blank name="email" label="Email (optional)" type="email" autoComplete="email" size={20} placeholder="optional" error={errors.email} />.
          </p>
          <p className="tp-letterform__line">
            I live in <Blank name="area" label="Your area (optional)" autoComplete="address-level2" maxLength={80} size={13} placeholder="e.g. Dubai Marina" error={errors.area} />, and I'm curious about{' '}
            <span className="tp-blank tp-blank--select">
              <label htmlFor={`${uid}-puppy`} className="sr-only">Puppy you're interested in (optional)</label>
              <select id={`${uid}-puppy`} name="puppy" defaultValue={puppyOptions[0]}>
                {puppyOptions.map((o, i) => <option key={`${o}-${i}`} value={o}>{o}</option>)}
              </select>
            </span>.
          </p>
          <label htmlFor={`${uid}-msg`} className="sr-only">Your message (optional)</label>
          <textarea id={`${uid}-msg`} name="message" rows={4} maxLength={2000} placeholder="Anything else you'd like to tell us…" className="tp-letterform__note" aria-invalid={errors.message ? true : undefined} />
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" name="website" defaultValue="" /></label></div>
          <p data-consent="true" className="mt-3 text-sm text-cocoa-soft">By posting this letter you confirm you are 18 or older and agree that we use your details to reply, as described in our <Link href="/privacy" className="link-ink">privacy notice</Link> (consent text {consentVersion}).</p>
          <div className="tp-letterform__sign">
            <p className="font-scrawl">with love, a future puppy parent</p>
            <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-70">{pending ? 'Sealing the envelope…' : 'Post my letter'}</button>
          </div>
        </form>
      )}
      {(phase === 'sealing' || phase === 'posting') && (
        <div aria-hidden="true" className="tp-post__scene">
          <svg viewBox="0 0 160 112" className="tp-post__envelope"><rect x="4" y="18" width="152" height="90" rx="6" fill="#fffdf8" stroke="#2a170e" strokeWidth="4" /><path d="M6 104 64 62M154 104 96 62" fill="none" stroke="#2a170e" strokeWidth="3" strokeLinecap="round" /><path className="tp-post__flap" d="M6 22 80 74 154 22" fill="#fbe3b4" stroke="#2a170e" strokeWidth="4" strokeLinejoin="round" /><circle cx="80" cy="72" r="11" fill="#a24a1a" stroke="#2a170e" strokeWidth="3" /></svg>
          <svg viewBox="0 0 200 260" className="tp-post__box"><rect x="86" y="170" width="28" height="86" fill="#5a3a28" stroke="#2a170e" strokeWidth="4" /><path d="M30 70a70 54 0 0 1 140 0v104H30z" fill="#c2622b" stroke="#2a170e" strokeWidth="5" strokeLinejoin="round" /><rect x="58" y="86" width="84" height="14" rx="7" fill="#2a170e" /><path d="M44 128h112" stroke="#2a170e" strokeWidth="3" strokeLinecap="round" opacity=".35" /><g className="tp-post__flag"><path d="M170 120V64" stroke="#2a170e" strokeWidth="5" strokeLinecap="round" /><path d="M170 64h22v16h-22" fill="#f2be6b" stroke="#2a170e" strokeWidth="4" strokeLinejoin="round" /></g></svg>
        </div>
      )}
      {phase === 'sent' && (
        <div ref={sentRef} tabIndex={-1} role="status" className="tp-post__sent">
          <svg viewBox="0 0 200 150" aria-hidden="true" className="tp-post__box tp-post__box--sent"><rect x="86" y="96" width="28" height="52" fill="#5a3a28" stroke="#2a170e" strokeWidth="4" /><path d="M30 50a70 44 0 0 1 140 0v52H30z" fill="#c2622b" stroke="#2a170e" strokeWidth="5" strokeLinejoin="round" /><rect x="58" y="58" width="84" height="12" rx="6" fill="#2a170e" /><path d="M170 92V22" stroke="#2a170e" strokeWidth="5" strokeLinecap="round" /><path d="M170 22h22v16h-22" fill="#f2be6b" stroke="#2a170e" strokeWidth="4" strokeLinejoin="round" /></svg>
          <p className="font-plush mt-4 text-[2rem]">{SENT.heading}</p>
          <p className="mx-auto mt-2 max-w-[40ch] text-cocoa-soft">{SENT.body}</p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-6">WhatsApp us</a>
        </div>
      )}
    </div>
  );
}
