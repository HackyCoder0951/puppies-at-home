'use client';

import { useMemo, useState } from 'react';
import { PupBuddy } from '@shared/ui';
import { matchesFilter, type Puppy, type PuppyFilter } from '../domain';
import { AVAILABLE_ART } from './sketchArt.generated';

/** Chip order follows the reference. */
const BREEDS = ['Maltipoo', 'Pomeranian', 'Poodle', 'Cavapoo', 'Shih Tzu'] as const;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

interface State {
  origin?: 'imported' | 'local';
  korean: boolean;
  breed?: string;
  gender?: 'male' | 'female';
}

const fromFilter = (f: PuppyFilter): State => ({
  origin: f.origin,
  korean: Boolean(f.collections?.includes('korean-teacup')),
  breed: f.breeds?.[0],
  gender: f.sexes?.[0],
});

const toFilter = (s: State): PuppyFilter => ({
  origin: s.origin,
  collections: s.korean ? ['korean-teacup'] : [],
  breeds: s.breed ? [s.breed] : [],
  sexes: s.gender ? [s.gender] : [],
});

function toQuery(s: State): string {
  const q = new URLSearchParams();
  if (s.breed) q.set('breed', s.breed);
  if (s.origin) q.set('origin', s.origin);
  if (s.korean) q.set('collection', 'korean-teacup');
  if (s.gender) q.set('gender', s.gender);
  const t = q.toString();
  return t ? `?${t}` : '';
}

/** Filter pad, result line, grid and empty state. Single choice for breed and boy/girl; where combines imported + Korean Teacup. */
export function PuppyBrowser({ puppies, initial, whatsappUrl }: { puppies: readonly Puppy[]; initial: PuppyFilter; whatsappUrl: string }) {
  const [state, setState] = useState<State>(() => fromFilter(initial));
  const filter = useMemo(() => toFilter(state), [state]);
  const matching = useMemo(() => new Set(puppies.filter((p) => matchesFilter(p, filter)).map((p) => p.slug)), [puppies, filter]);
  const filtered = Boolean(state.origin || state.korean || state.breed || state.gender);
  const n = matching.size;

  const update = (next: State) => {
    setState(next);
    history.replaceState(null, '', `${location.pathname}${toQuery(next)}`);
  };
  const chip = (label: string, pressed: boolean, onClick: () => void) => (
    <button key={label} type="button" aria-pressed={pressed} className="tp-sticker-chip" onClick={onClick}>{label}</button>
  );
  const rowLabel = 'font-scrawl mr-1 w-full shrink-0 text-cocoa-soft sm:w-28';

  return (
    <div>
      <div role="group" aria-label="Filter puppies" className="tp-sketchpad flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={rowLabel}>where</span>
          {chip('Everywhere', !state.origin && !state.korean, () => update({ ...state, origin: undefined, korean: false }))}
          {chip('Imported', state.origin === 'imported', () => update({ ...state, origin: state.origin === 'imported' ? undefined : 'imported' }))}
          {chip('Korean Teacup', state.korean, () => update({ ...state, korean: !state.korean }))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={rowLabel}>breed</span>
          {BREEDS.map((b) => chip(b, state.breed === slug(b), () => update({ ...state, breed: state.breed === slug(b) ? undefined : slug(b) })))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={rowLabel}>boy or girl</span>
          {chip('Boys', state.gender === 'male', () => update({ ...state, gender: state.gender === 'male' ? undefined : 'male' }))}
          {chip('Girls', state.gender === 'female', () => update({ ...state, gender: state.gender === 'female' ? undefined : 'female' }))}
        </div>
      </div>
      <p className="font-scrawl mt-10 text-lg text-[var(--ink-soft)]" aria-live="polite">
        {filtered ? `${n} ${n === 1 ? 'puppy' : 'puppies'} match` : `${n} puppies looking for a home`}
      </p>
      {n > 0 ? (
        <div>
          <ul className="tp-sketches mt-20">
            {puppies.map((p) => (
              <li key={p.slug} hidden={!matching.has(p.slug)}>{AVAILABLE_ART[p.slug]}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="tp-sketchpad mt-10 grid items-center gap-6 md:grid-cols-[auto_1fr] md:gap-10">
          <PupBuddy live className="mx-auto w-44 md:w-52" />
          <div>
            <p className="font-plush text-big">No puppies match just now.</p>
            <p className="mt-3 max-w-[48ch] text-cocoa-soft">Tell us what you&apos;re hoping for and we&apos;ll let you know what&apos;s in our showroom or what we can bring in for you.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`${whatsappUrl.split('?')[0]}?text=${encodeURIComponent("Hi TeddyPups! I'm looking for a puppy — what do you have at the moment?")}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">Ask on WhatsApp</a>
              <button type="button" className="btn btn-ghost" onClick={() => update({ korean: false })}>Show all puppies</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
