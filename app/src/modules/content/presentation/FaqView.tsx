'use client';

import { useId, useState } from 'react';
import { Button, Container, Kicker, Mascot, NoteShape } from '@shared/ui';
import { cn } from '@shared/lib';
import { searchFaqs, type Faq } from '../domain';

export function FaqView({ faqs, whatsappUrl }: { faqs: readonly Faq[]; whatsappUrl: string }) {
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const uid = useId();
  const shown = searchFaqs(faqs, term);
  return (
    <main id="main" style={{ background: 'var(--scene-faq)' }} className="text-milk">
      <Container className="grid gap-10 py-14 lg:grid-cols-[22rem_1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Kicker onDark>sniff out a question</Kicker>
          <h1 className="mt-4 text-5xl text-milk md:text-7xl">Questions &amp; answers</h1>
          <p className="mt-4 max-w-sm">Can&apos;t find what you&apos;re looking for? Message us on WhatsApp — our team is available 24/7.</p>
          <label className="mt-6 block font-semibold" htmlFor={`${uid}-q`}>Sniff out a question</label>
          <input id={`${uid}-q`} type="search" value={term} onChange={(e) => { setTerm(e.target.value); setOpen(null); }} placeholder="Search the board" className="mt-2 w-full rounded-full border-2 border-cocoa bg-milk px-5 py-3 text-cocoa" />
          <p className="mt-3" role="status">{shown.length} {shown.length === 1 ? 'note' : 'notes'} on the board</p>
          <Mascot className="mt-4 size-24" title="Mascot with a question" />
          <div className="mt-4"><Button href={whatsappUrl} variant="whatsapp" target="_blank" rel="noopener noreferrer">Ask your own question</Button></div>
        </div>
        <div className="rounded-(--radius-card) bg-cork p-6 md:p-10" style={{ background: 'var(--color-cork)' }}>
          {shown.length === 0 ? (
            <NoteShape><p className="text-cocoa">No notes match that. Try another word, or ask us on WhatsApp.</p></NoteShape>
          ) : (
            <ul className="m-0 grid list-none gap-8 p-0 md:grid-cols-2">
              {shown.map((f, i) => {
                const isOpen = open === i;
                return (
                  <li key={f.question}>
                    <NoteShape tilt={isOpen ? 0 : i % 2 ? -1 : 1} className={cn('text-cocoa-soft')}>
                      <h2 className="m-0 text-xl">
                        <button type="button" aria-expanded={isOpen} aria-controls={`${uid}-a${i}`} onClick={() => setOpen(isOpen ? null : i)} className="w-full border-0 bg-transparent p-0 text-left font-[family-name:var(--font-display)] text-xl font-extrabold text-cocoa">{f.question}</button>
                      </h2>
                      <div id={`${uid}-a${i}`} hidden={!isOpen} className="mt-3">{f.answer}</div>
                    </NoteShape>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Container>
    </main>
  );
}
