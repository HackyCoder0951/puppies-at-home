/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';
import { PupBuddy } from '@shared/ui';
import type { Puppy, PuppyFilter } from '../domain';
import { GONE_STRIP_ART } from './goneStripArt.generated';
import { PuppyBrowser } from './PuppyBrowser';

export function PuppiesView({ puppies, goneSlugs, filter, whatsappUrl }: { puppies: readonly Puppy[]; goneSlugs: readonly string[]; filter: PuppyFilter; whatsappUrl: string }) {
  return (
    <main id="main" tabIndex={-1} className="relative pt-[var(--header-h)] outline-none"><div data-page="pups" className="tp-page"><section aria-labelledby="pups-title" className="tp-sketchbook"><div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16"><div className="tp-sketchbook__head"><div className="tp-sketchbook__words"><p className="font-scrawl text-lg text-toffee-ink" data-reveal="true">from Teddy's sketchbook</p><h1 id="pups-title" className="font-plush text-giant tp-sketchbook__title" data-reveal="true">Available puppies<svg aria-hidden="true" viewBox="0 0 400 24" preserveAspectRatio="none" className="tp-sketchbook__underline"><path d="M4 15c40-9 70 5 112-2s70-9 112 0 74 8 116-1 38-4 52 1" pathLength="1"></path></svg></h1><p className="tp-sketchbook__lede text-lede mt-6 max-w-[46ch] text-cocoa-soft" data-reveal="true">Every listing shows real photos of the actual puppy. Open a profile to see them all, then ask us about them on WhatsApp.</p></div><div className="tp-sketchbook__self" data-reveal="true"><PupBuddy facing="left" /><span className="font-scrawl tp-sketchbook__caption">self-portrait</span></div></div><div className="mt-12"><PuppyBrowser puppies={puppies} initial={filter} whatsappUrl={whatsappUrl} /></div></div></section><section aria-labelledby="gone-title" className="tp-gone-strip"><div className="gutter mx-auto flex max-w-[110rem] flex-col gap-10 md:flex-row md:items-center"><div className="md:w-1/3" data-reveal="true"><h2 id="gone-title" className="font-plush text-big">Already gone home</h2><p className="mt-3 text-cocoa-soft">These puppies have found their families.</p><Link className="btn btn-primary mt-6" href="/gone-home">See the puppies who've gone home</Link></div><ul className="tp-gone-strip__row" aria-label="Some puppies who have gone home">{goneSlugs.map((slug) => <li key={slug}>{GONE_STRIP_ART[slug]}</li>)}</ul></div></section></div></main>
  );
}
