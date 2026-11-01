import { paths } from '@nav';
import { Button, Container, Kicker, Mascot } from '@shared/ui';
import { isEmptyFilter, type PuppyFilter } from '../domain';
import type { PuppyListing } from '../application';
import { FilterPad } from './FilterPad';
import { PuppyCard } from './PuppyCard';

export function PuppiesView({ listing, filter, whatsappUrl }: { listing: PuppyListing; filter: PuppyFilter; whatsappUrl: string }) {
  const filtered = !isEmptyFilter(filter);
  const n = listing.puppies.length;
  return (
    <main id="main" style={{ background: 'var(--scene-1)' }}>
      <Container className="pt-12">
        <div className="flex items-center justify-between gap-6">
          <div>
            <Kicker>from Teddy&apos;s sketchbook</Kicker>
            <h1 className="mt-4 text-5xl md:text-8xl">Available puppies</h1>
            <p className="mt-4 max-w-xl text-xl">Every listing shows real photos of the actual puppy. Open a profile to see them all, then ask us about them on WhatsApp.</p>
          </div>
          <Mascot className="hidden size-40 shrink-0 sm:block md:size-52" title="Teddy self-portrait" />
        </div>
        <div className="mt-10"><FilterPad facets={listing.facets} filter={filter} /></div>
        <p className="mt-8 flex flex-wrap items-center gap-4 text-xl" role="status">
          <span className="font-semibold text-cocoa">{filtered ? `${n} ${n === 1 ? 'puppy matches' : 'puppies match'}` : `${n} puppies looking for a home`}</span>
          {filtered && <a href={paths.puppies()} className="text-toffee-deep underline">Clear filters</a>}
        </p>
        {n > 0 ? (
          <ul className="m-0 mt-8 grid gap-x-8 gap-y-10 p-0 [grid-template-columns:repeat(auto-fill,minmax(min(14.5rem,40vw),1fr))]">
            {listing.puppies.map((p, i) => <PuppyCard key={p.slug} puppy={p} index={i} />)}
          </ul>
        ) : (
          <div className="mt-8 rounded-(--radius-card) border-[3px] border-dashed border-cocoa p-8 text-center">
            <p className="text-2xl font-semibold text-cocoa">No puppies match those choices just now.</p>
            <p className="mt-2">Clear a filter, or ask us on WhatsApp about what is arriving soon.</p>
            <div className="mt-5 flex justify-center gap-3">
              <Button href={paths.puppies()} variant="ghost">Clear filters</Button>
              <Button href={whatsappUrl} variant="whatsapp" target="_blank" rel="noopener noreferrer">Ask on WhatsApp</Button>
            </div>
          </div>
        )}
      </Container>
      <section className="mt-16 bg-honey-soft py-12" aria-labelledby="gone-home-heading">
        <Container>
          <h2 id="gone-home-heading" className="text-4xl">Already gone home</h2>
          <p className="mt-2 text-lg">These puppies have found their families.</p>
          <ul className="m-0 mt-8 grid grid-cols-2 gap-6 p-0 md:grid-cols-5">
            {listing.goneHomePreview.map((p) => <PuppyCard key={p.slug} puppy={p} />)}
          </ul>
          <div className="mt-8"><Button href={paths.goneHome()} variant="ghost">See the puppies who&apos;ve gone home</Button></div>
        </Container>
      </section>
    </main>
  );
}
