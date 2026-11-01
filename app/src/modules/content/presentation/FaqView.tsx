'use client';
/* eslint-disable react/no-unescaped-entities */
import type React from 'react';
import { useId, useState } from 'react';
import { PupBuddy } from '@shared/ui';
import { searchFaqs, type Faq } from '../domain';

const ASK = 'https://wa.me/971541676733?text=Hi%20TeddyPups!%20I%20have%20a%20question%3A';
const NOTE_STYLES = [['-1.6deg', 'var(--color-toffee)'], ['1.2deg', 'var(--color-sky-deep)'], ['-0.8deg', '#d9a13c'], ['1.8deg', '#c45a6a'], ['-1.2deg', 'var(--color-toffee)'], ['0.7deg', 'var(--color-sky-deep)'], ['-1.9deg', '#d9a13c'], ['1.4deg', '#c45a6a'], ['-1.6deg', 'var(--color-toffee)']] as const;

export function FaqView({ faqs }: { faqs: readonly Faq[] }) {
  const uid = useId();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const shown = searchFaqs(faqs, term);
  return (
    <main id="main" tabIndex={-1} className="relative pt-[var(--header-h)] outline-none"><div data-page="faq" className="tp-page"><section data-pup-scene="true" data-tone="dark" className="tp-scene tp-faqroom overflow-hidden" style={{"--sky-top": "#a95e32", "--sky-bottom": "#331c11"} as React.CSSProperties} aria-labelledby="faq-title"><div className="gutter relative mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16"><header className="max-w-4xl"><h1 id="faq-title" className="font-plush text-giant">Questions & answers</h1><p className="text-lede mt-6 max-w-[52ch] text-[var(--ink-soft)]">Can't find what you're looking for? Message us on WhatsApp — our team is available 24/7.</p></header><div className="mt-12 md:mt-16"><div className="tp-notes"><aside className="tp-notes__side" aria-label="Find a question"><label htmlFor={`${uid}-q`} className="font-scrawl tp-notes__label">sniff out a question</label><div className="tp-notes__search"><svg viewBox="0 0 24 24" aria-hidden="true" className="tp-notes__lens"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg><input id={`${uid}-q`} value={term} onChange={(e) => { setTerm(e.target.value); setOpen(null); }} type="search" placeholder="delivery, Korea, vaccinated…" autoComplete="off" /></div><p className="tp-notes__count" aria-live="polite">{shown.length} {shown.length === 1 ? "note" : "notes"} on the board</p><div className="tp-notes__teddy"><span aria-hidden="true" className="tp-notes__bubble font-plush"><span className="tp-notes__q">?</span><span className="tp-notes__a">!</span></span><PupBuddy /></div><a href={ASK} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp tp-notes__ask">Ask your own question</a></aside><div className="tp-notes__board"><ul className="tp-notes__list">{shown.map((q, i) => (<li key={q.question} className="tp-note" data-reveal="true" {...(open === i ? { "data-unfolded": "" } : {})} style={{ "--tilt": NOTE_STYLES[i % NOTE_STYLES.length]![0], "--pin": NOTE_STYLES[i % NOTE_STYLES.length]![1], "--i": String(i) } as React.CSSProperties}><span aria-hidden="true" className="tp-note__pin"></span><h2 className="tp-note__q"><button type="button" id={`${uid}-q${i}`} aria-expanded={open === i} aria-controls={`${uid}-a${i}`} onClick={() => setOpen(open === i ? null : i)}><span className="font-plush-text">{q.question}</span><span aria-hidden="true" className="tp-note__chevron"></span></button></h2><div id={`${uid}-a${i}`} role="region" aria-labelledby={`${uid}-q${i}`} className="tp-note__answer" inert={open !== i}><div className="tp-note__flap"><p>{q.answer}</p></div></div></li>))}{shown.length === 0 && (<li className="tp-note tp-note--empty"><span aria-hidden="true" className="tp-note__pin"></span><p className="font-plush-text">No notes match that. Try another word, or ask us on WhatsApp.</p></li>)}</ul></div></div></div></div></section></div></main>
  );
}
