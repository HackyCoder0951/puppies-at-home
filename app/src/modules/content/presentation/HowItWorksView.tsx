'use client';

import { useState } from 'react';
import { paths } from '@nav';
import { Button, Card, Container, Kicker, SectionNumber, Toggle } from '@shared/ui';
import { cn } from '@shared/lib';
import type { HowItWorksCopy } from '../domain';

const anchors = [['Two ways home', 'ways'], ['Our premium puppy promise', 'promise'], ['Delivery & collection', 'delivery'], ['Why choose us', 'why']] as const;

export function HowItWorksView({ whatsappUrl, copy }: { whatsappUrl: string; copy: HowItWorksCopy }) {
  const { ways, promise, delivery, whyUs } = copy;
  const [mode, setMode] = useState<'dubai' | 'imported'>('dubai');
  const way = ways[mode];
  return (
    <main id="main" style={{ background: 'var(--scene-how)' }}>
      <Container className="py-14">
        <Kicker>from hello to home</Kicker>
        <h1 className="mt-4 text-5xl md:text-8xl">How it works</h1>
        <p className="mt-4 max-w-xl text-xl">Two simple ways to bring a TeddyPups puppy home, with care at every step.</p>
        <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-3">
          {anchors.map(([label, id]) => <a key={id} href={`#${id}`} className="rounded-full border-2 border-cocoa bg-milk px-4 py-2 font-semibold text-cocoa no-underline hover:bg-honey-soft">{label}</a>)}
        </nav>

        <section id="ways" className="mt-16 scroll-mt-24" aria-labelledby="ways-h">
          <h2 id="ways-h" className="text-4xl">Two ways home</h2>
          <div className="mt-5 flex items-center gap-4" role="group" aria-label="Choose a way">
            {(['dubai', 'imported'] as const).map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={cn('rounded-full border-2 border-cocoa px-5 py-2 font-semibold', mode === m ? 'bg-cocoa text-milk' : 'bg-milk text-cocoa')}>{ways[m].label}</button>
            ))}
            <span className="sr-only"><Toggle pressed={mode === 'imported'} label="Imported" /></span>
          </div>
          <h3 className="mt-8 text-3xl">{way.heading}</h3>
          <p className="mt-2">{way.intro}</p>
          <ol className="m-0 mt-6 grid list-none gap-5 p-0 md:grid-cols-4">
            {way.steps.map((s, i) => <li key={s.title}><Card kind="step" className="h-full p-5"><SectionNumber value={i + 1} /><h4 className="mt-2 text-2xl">{s.title}</h4><p className="mt-2">{s.text}</p></Card></li>)}
          </ol>
          <div className="mt-8"><Button href={mode === 'dubai' ? paths.puppies({ origin: 'local' }) : paths.puppies({ origin: 'imported' })}>See {mode === 'dubai' ? 'local' : 'imported'} puppies</Button></div>
        </section>

        <section id="promise" className="mt-16 scroll-mt-24" aria-labelledby="promise-h">
          <h2 id="promise-h" className="text-4xl">Our premium puppy promise</h2>
          <ul className="m-0 mt-5 grid list-none gap-4 p-0 md:grid-cols-3">{promise.map((p) => <li key={p}><Card className="h-full p-5">{p}</Card></li>)}</ul>
        </section>

        <section id="delivery" className="mt-16 scroll-mt-24" aria-labelledby="delivery-h">
          <h2 id="delivery-h" className="text-4xl">Delivery &amp; collection</h2>
          <ul className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-2">{delivery.map(([t, d]) => <li key={t}><Card className="h-full p-5"><h3 className="text-2xl">{t}</h3><p className="mt-1">{d}</p></Card></li>)}</ul>
        </section>

        <section id="why" className="mt-16 scroll-mt-24" aria-labelledby="why-h">
          <h2 id="why-h" className="text-4xl">Why choose us</h2>
          <ul className="m-0 mt-5 list-none space-y-2 p-0">{whyUs.map((w) => <li key={w}>♥ {w}</li>)}</ul>
          <Card className="mt-8 max-w-2xl p-6">
            <h3 className="text-3xl">Ready to meet your new best friend?</h3>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href={paths.puppies()}>See puppies</Button>
              <Button href={whatsappUrl} variant="whatsapp" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</Button>
            </div>
          </Card>
        </section>
      </Container>
    </main>
  );
}
