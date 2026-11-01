 
import Link from 'next/link';
import type { ReactNode } from 'react';
import { PupBuddy, Paw } from '@shared/ui';
import { SEX_LABEL, cover, type Puppy } from '../domain';
import type { PuppyDetail } from '../application';
import { StoryGallery } from './StoryGallery';
import { StoryRibbon } from './StoryRibbon';
import { PuppyThumb } from './PuppyThumb';

const CHECKS = ['Vaccinated', 'Dewormed', 'Verified health certificate from licensed vets', 'Thoroughly checked before joining your family'];
const IMPORT_STEPS = [
  ['Reserve your puppy', 'Tell us which puppy has captured your heart.'],
  ['Personalized consultation', "We finalize details with you and share updates on your puppy's journey."],
  ['Import and arrival', 'We manage health checks, travel arrangements, and documentation.'],
  ['Welcome home', 'We help your new puppy settle in and ensure a smooth transition into your home.'],
] as const;

function whatsappLabel(p: Puppy) {
  if (p.status === 'gone-home') return 'Ask about a puppy like this';
  return p.hasPersonalName ? `Ask about ${p.name} on WhatsApp` : 'Ask about this puppy';
}

const Check = () => (
  <svg viewBox="0 0 32 32" className="mt-0.5 size-6 shrink-0 text-toffee-deep" aria-hidden="true">
    <path d="M5 17l7 7L27 8" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"></path>
  </svg>
);

/** Puppy page ("storybook"). `enquiry` is the enquiry form, supplied by the page so this module does not depend on crm. */
export function PuppyDetailView({ detail, siteUrl, whatsappHref, enquiry }: { detail: PuppyDetail; siteUrl: string; whatsappHref: string; enquiry: ReactNode }) {
  const { puppy: p, prev, next } = detail;
  const gone = p.status === 'gone-home';
  const img = cover(p);
  const facts: [string, string][] = [['Breed', p.breed], ['Boy or girl', SEX_LABEL[p.sex]], ['Age', p.age]];
  if (p.colour) facts.push(['Colour', p.colour]);
  facts.push(['Where', p.where]);
  const chapter = (n: number, text: ReactNode) => (
    <p className="tp-chapter"><span aria-hidden="true" className="tp-chapter__n font-plush">{n}</span><span className="font-scrawl">{text}</span></p>
  );
  const breadcrumb = { ld: { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Puppies', item: `${siteUrl}/puppies` },
    { '@type': 'ListItem', position: 2, name: p.name, item: `${siteUrl}/puppies/${p.slug}` },
  ] } };
  return (
    <main id="main" tabIndex={-1} className="relative pt-[var(--header-h)] outline-none">
      <div data-page="pup" className="tp-page">
        <article className="tp-storybook" style={{ background: `linear-gradient(180deg, color-mix(in oklab, ${img?.color ?? '#f2be6b'} 24%, var(--color-milk)) 0, var(--color-milk) 85%)` }}>
          <StoryRibbon />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb.ld) }} />
          <div className="gutter mx-auto max-w-[110rem] pb-20 pt-8 md:pt-12">
            <nav aria-label="Breadcrumb" className="text-[0.95rem] font-semibold text-cocoa-soft">
              <Link className="link-ink" href={gone ? '/gone-home' : '/puppies'}>{gone ? 'Gone home' : 'Available puppies'}</Link>
              <span aria-hidden="true"> / </span>
              <span aria-current="page">{p.name}</span>
            </nav>
            {chapter(1, p.sectionTag ?? "hello, it's me")}
            <div className="mt-4 grid gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="min-w-0 lg:col-span-7"><StoryGallery media={p.media} name={p.name} /></div>
              <div className="min-w-0 lg:col-span-5">
                <div className="lg:sticky lg:top-[calc(var(--header-h)+5.5rem)]">
                  <div className="tp-tag tp-board mt-16 !rounded-[2.2rem_2.2rem_2.2rem_0.6rem] !p-7 md:!p-9 lg:mt-20" data-reveal="true">
                    <span aria-hidden="true" className="tp-tag__ring"></span>
                    <PupBuddy className="absolute -top-[4.8rem] right-6 w-[9.5rem]" />
                    {gone ? (
                      <span className="inline-grid place-items-center rounded-full border-[3px] border-current px-3 py-1 font-scrawl text-sm uppercase tracking-wide -rotate-6 text-toffee-deep">Gone home ♥</span>
                    ) : (
                      <span className="chip"><Paw className="size-4 text-toffee" />Available</span>
                    )}
                    <h1 className="font-plush mt-4 text-[clamp(2.6rem,5vw,4.6rem)]">{p.name}</h1>
                    {p.hasPersonalName && <p className="mt-2 text-lg font-semibold text-cocoa-soft">{p.breed}</p>}
                    <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4">
                      {facts.map(([k, v]) => (
                        <div key={k}><dt className="font-scrawl text-sm text-cocoa-soft">{k}</dt><dd className="mt-0.5 text-[1.05rem] font-semibold">{v}</dd></div>
                      ))}
                    </dl>
                    <div className="mt-8 flex flex-col gap-3">
                      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">{whatsappLabel(p)}</a>
                      <a href={`#enquire-${p.slug}`} className="btn btn-ghost">Send an enquiry</a>
                    </div>
                  </div>
                  <div className="tp-paper mt-8 -rotate-1">
                    {chapter(2, <>what comes with {p.hasPersonalName ? p.name : `this ${p.breed}`}</>)}
                    <h2 className="font-plush mt-1 text-[1.9rem]">Every Teddy Pup comes</h2>
                    <ul className="mt-4 space-y-2.5">
                      {CHECKS.map((c) => <li key={c} className="flex items-start gap-3 font-semibold"><Check />{c}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {!gone && (
              <section aria-labelledby={`home-steps-${p.slug}`} className="mt-20">
                {chapter(3, 'the way home')}
                <h2 id={`home-steps-${p.slug}`} className="font-plush text-big mt-3">Coming home from abroad</h2>
                <ol className="tp-trail tp-trail--row tp-trail--paws mt-10">
                  {IMPORT_STEPS.map(([t, d], i) => (
                    <li key={t}>
                      <span aria-hidden="true" className="tp-trail__num font-plush">{i + 1}</span>
                      <h3 className="font-plush-text text-xl font-bold leading-tight">{t}</h3>
                      <p className="mt-2 max-w-[38ch] text-cocoa-soft">{d}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            <section id={`enquire-${p.slug}`} aria-labelledby={`enquire-title-${p.slug}`} className="tp-letter mt-20 grid gap-10 lg:grid-cols-12">
              <span aria-hidden="true" className="tp-letter__stamp"><Paw className="size-9" /></span>
              <div className="lg:col-span-4">
                {chapter(gone ? 3 : 4, 'dear TeddyPups…')}
                <h2 id={`enquire-title-${p.slug}`} className="font-plush text-big mt-2">{p.enquiryTitle}</h2>
                <p className="mt-4 text-cocoa-soft">Leave your details and our team will get back to you promptly — or message us on WhatsApp for the quickest reply.</p>
              </div>
              <div className="lg:col-span-7 lg:col-start-6">{enquiry}</div>
            </section>
            <nav aria-label="More puppies" className="mt-16 grid gap-4 sm:grid-cols-2">
              <PuppyThumb puppy={prev} label="Previous pup" />
              <PuppyThumb puppy={next} label="Next pup" />
            </nav>
          </div>
        </article>
      </div>
    </main>
  );
}
