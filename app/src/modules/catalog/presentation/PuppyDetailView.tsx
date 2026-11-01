import Link from 'next/link';
import type { ReactNode } from 'react';
import { paths } from '@nav';
import { Breadcrumb, Button, Card, Container, Kicker, Mascot, Pin, SectionNumber, StatusTag } from '@shared/ui';
import { SEX_LABEL, type Puppy } from '../domain';
import type { PuppyDetail } from '../application';
import { PuppyCard } from './PuppyCard';
import { PuppyGallery } from './PuppyGallery';

const checklist = ['Vaccinated', 'Dewormed', 'Verified health certificate from licensed vets', 'Thoroughly checked before joining your family'];
const steps = [
  ['Reserve your puppy', 'Tell us which puppy has captured your heart.'],
  ['Personalized consultation', "We finalize details with you and share updates on your puppy's journey."],
  ['Import and arrival', 'We manage health checks, travel arrangements, and documentation.'],
  ['Welcome home', 'We help your new puppy settle in and ensure a smooth transition into your home.'],
];
const localSteps = [
  ['Say hello', 'Tell us which puppy has captured your heart.'],
  ['Come and meet', 'Visit our Downtown Dubai showroom and spend time together.'],
  ['Choose together', 'We finalize details and share health papers with you.'],
  ['Welcome home', 'Pick up your puppy or have them delivered within Dubai.'],
];

const breadcrumbLd = (p: Puppy) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Puppies', item: paths.puppies() },
    { '@type': 'ListItem', position: 2, name: p.name },
  ],
});

function whatsappLabel(p: Puppy) {
  if (p.status === 'gone-home') return 'Ask about a puppy like this';
  return p.hasPersonalName ? `Ask about ${p.name} on WhatsApp` : 'Ask about this puppy';
}

/** `enquiry` is the enquiry form, supplied by the page so this module does not depend on crm. */
export function PuppyDetailView({ detail, enquiry, whatsappFor }: { detail: PuppyDetail; enquiry: ReactNode; whatsappFor: (text: string) => string }) {
  const { puppy: p, prev, next } = detail;
  const gone = p.status === 'gone-home';
  const facts: [string, string][] = [['Breed', p.breed], ['Boy or girl', SEX_LABEL[p.sex]], ['Age', p.age], ['Where', p.where]];
  if (p.colour) facts.push(['Colour', p.colour]);
  const href = whatsappFor(p.whatsappText);
  return (
    <main id="main" style={{ background: 'var(--scene-detail)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(p)) }} />
      <Container className="py-10">
        <Breadcrumb items={[{ label: 'Puppies', href: paths.puppies() }, { label: gone ? 'Gone home' : 'Available puppies', href: gone ? paths.goneHome() : paths.puppies() }, { label: p.name }]} />
        <div className="mt-6 flex items-center gap-3"><SectionNumber value={1} /><Kicker>{p.sectionTag ?? "hello, it's me"}</Kicker></div>
        <div className="mt-8 grid items-start gap-10 lg:grid-cols-2">
          <PuppyGallery media={p.media} />
          <div className="relative">
            <Card className="relative -rotate-1 p-8">
              <Pin />
              <Mascot className="absolute -right-4 -top-10 size-20" title="" />
              <StatusTag tone={gone ? 'home' : 'available'}>{gone ? 'Gone home ♥' : 'Available'}</StatusTag>
              <h1 className="mt-4 text-5xl md:text-7xl">{p.name}</h1>
              {p.hasPersonalName && <p className="mt-1 text-xl">{p.breed}</p>}
              <dl className="mt-6 grid grid-cols-2 gap-4">
                {facts.map(([k, v]) => (
                  <div key={k}><dt className="font-[family-name:var(--font-hand)] text-sm text-toffee-ink">{k}</dt><dd className="m-0 text-lg font-semibold text-cocoa">{v}</dd></div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={href} variant="whatsapp" target="_blank" rel="noopener noreferrer">{whatsappLabel(p)}</Button>
                <Button href="#enquire" variant="ghost">Send an enquiry</Button>
              </div>
            </Card>
          </div>
        </div>
        <section className="mt-16" aria-labelledby="comes-with">
          <h2 id="comes-with" className="text-4xl">what comes with {p.hasPersonalName ? p.name : 'this puppy'}</h2>
          <p className="mt-2 text-lg">Every Teddy Pup comes</p>
          <ul className="m-0 mt-5 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {checklist.map((c) => <li key={c} className="rounded-2xl border-2 border-cocoa bg-milk px-5 py-3 font-semibold text-cocoa">✓ {c}</li>)}
          </ul>
        </section>
        <section className="mt-16" aria-labelledby="way-home">
          <h2 id="way-home" className="text-4xl">{p.origin === 'imported' ? 'Coming home from abroad' : 'The way home'}</h2>
          <ol className="m-0 mt-6 grid list-none gap-5 p-0 md:grid-cols-4">
            {(p.origin === 'imported' ? steps : localSteps).map(([t, d], i) => (
              <li key={t}><Card kind="step" className="h-full p-5"><SectionNumber value={i + 1} /><h3 className="mt-2 text-2xl">{t}</h3><p className="mt-2">{d}</p></Card></li>
            ))}
          </ol>
        </section>
        <section id="enquire" className="mt-16 scroll-mt-24" aria-labelledby="enquiry-title">
          <p className="font-[family-name:var(--font-hand)] text-xl text-toffee-ink">dear TeddyPups…</p>
          <h2 id="enquiry-title" className="text-4xl">{p.enquiryTitle}</h2>
          <p className="mt-2">Leave your details and our team will get back to you promptly — or message us on WhatsApp for the quickest reply.</p>
          <div className="mt-6 max-w-2xl">{enquiry}</div>
        </section>
        <nav className="mt-16 grid gap-8 sm:grid-cols-2" aria-label="More puppies">
          <div><p className="mb-3 font-semibold text-cocoa">Previous pup</p><ul className="m-0 p-0"><PuppyCard puppy={prev} /></ul></div>
          <div><p className="mb-3 font-semibold text-cocoa">Next pup</p><ul className="m-0 p-0"><PuppyCard puppy={next} /></ul></div>
        </nav>
        <p className="mt-10"><Link href={paths.puppies()} className="text-toffee-deep underline">Back to all puppies</Link></p>
      </Container>
    </main>
  );
}
