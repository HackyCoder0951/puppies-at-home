'use client';

import { useState } from 'react';
import { paths } from '@nav';
import { Button, Card, Container, Kicker } from '@shared/ui';
import { cn } from '@shared/lib';
import type { HowItWorksCopy } from '../domain';

const anchors = [['Two ways home', 'ways'], ['Our premium puppy promise', 'promise'], ['Delivery & collection', 'delivery'], ['Why choose us', 'why']] as const;

export function HowItWorksView({ whatsappUrl, copy }: { whatsappUrl: string; copy: HowItWorksCopy }) {
  const [mode, setMode] = useState<'dubai' | 'imported'>('dubai');
  const way = copy.ways[mode];
  return (
    <main id="main" style={{ background: 'var(--scene-how)' }}>
      <Container className="py-14">
        <h1 className="text-5xl md:text-8xl">How it works</h1>
        <p className="mt-4 max-w-2xl text-xl">{copy.intro}</p>
        <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-3">
          {anchors.map(([label, id], i) => (
            <a key={id} href={`#${id}`} className="flex items-center gap-2 rounded-full border-2 border-cocoa bg-milk px-4 py-2 font-semibold text-cocoa no-underline hover:bg-honey-soft">
              <span className="grid size-6 place-items-center rounded-full bg-cocoa text-sm text-milk">{i + 1}</span>{label}
            </a>
          ))}
        </nav>

        <section id="ways" className="mt-16 scroll-mt-24" aria-labelledby="ways-h">
          <Kicker>choose your way</Kicker>
          <h2 id="ways-h" className="mt-3 text-4xl">Two ways home</h2>
          <div className="mt-5 flex flex-wrap items-center gap-4" role="group" aria-label="Choose a way">
            {(['dubai', 'imported'] as const).map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={cn('rounded-full border-2 border-cocoa px-5 py-2 text-left font-semibold', mode === m ? 'bg-cocoa text-milk' : 'bg-milk text-cocoa')}>
                {copy.ways[m].label} <span className="block text-sm font-normal">{copy.ways[m].sub}</span>
              </button>
            ))}
          </div>
          <h3 className="mt-8 text-3xl">{way.heading}</h3>
          {way.paragraphs.map((t) => <p key={t} className="mt-3 max-w-3xl">{t}</p>)}
          <p className="mt-3 font-[family-name:var(--font-hand)] text-lg text-toffee-ink">{way.place}</p>
          <ol className="m-0 mt-6 grid list-none gap-5 p-0 md:grid-cols-2 xl:grid-cols-4">
            {way.steps.map((s, i) => <li key={s.title}><Card kind="step" className="h-full p-5"><p className="font-[family-name:var(--font-hand)] text-toffee-ink">Step {i + 1}</p><h4 className="mt-1 text-2xl">{s.title}</h4><p className="mt-2">{s.text}</p></Card></li>)}
          </ol>
          <div className="mt-8"><Button href={mode === 'dubai' ? paths.puppies({ origin: 'local' }) : paths.puppies({ origin: 'imported' })}>See {mode === 'dubai' ? 'local' : 'imported'} puppies</Button></div>
        </section>

        <section id="promise" className="mt-16 scroll-mt-24" aria-labelledby="promise-h">
          <Kicker>puppy passport</Kicker>
          <h2 id="promise-h" className="mt-3 text-4xl">Our premium puppy promise</h2>
          <ul className="m-0 mt-5 grid list-none gap-4 p-0 md:grid-cols-3">{copy.promise.map((p) => <li key={p.title}><Card className="h-full p-5"><h3 className="text-2xl">{p.title}</h3><p className="mt-2">{p.text}</p></Card></li>)}</ul>
        </section>

        <section id="delivery" className="mt-16 scroll-mt-24" aria-labelledby="delivery-h">
          <h2 id="delivery-h" className="text-4xl">Delivery &amp; collection</h2>
          <p className="mt-3 max-w-3xl">{copy.deliveryIntro}</p>
          <ul className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-2">{copy.delivery.map((d) => <li key={d.title}><Card className="h-full p-5"><h3 className="text-2xl">{d.title}</h3><p className="mt-1">{d.text}</p></Card></li>)}</ul>
        </section>

        <section id="why" className="mt-16 scroll-mt-24" aria-labelledby="why-h">
          <h2 id="why-h" className="text-4xl">Why choose us</h2>
          <p className="mt-3 max-w-3xl">{copy.whyIntro}</p>
          <ul className="m-0 mt-5 grid list-none gap-4 p-0 md:grid-cols-3">{copy.whyUs.map((w) => <li key={w.title}><Card className="h-full p-5"><h3 className="text-2xl">{w.title}</h3><p className="mt-1">{w.text}</p></Card></li>)}</ul>
          <Card className="mt-8 max-w-3xl p-6">
            <h3 className="text-3xl">{copy.closing.title}</h3>
            <p className="mt-2">{copy.closing.text}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href={whatsappUrl} variant="whatsapp" target="_blank" rel="noopener noreferrer">Ask us on WhatsApp</Button>
              <Button href={paths.puppies()} variant="ghost">See available puppies</Button>
            </div>
          </Card>
        </section>
      </Container>
    </main>
  );
}
