import Link from 'next/link';
import { paths } from '@nav';
import { Button, Container, Kicker, PlaceholderImage, TicketShape } from '@shared/ui';
import { SEX_LABEL, cover, type Puppy } from '../domain';

function Ticket({ p }: { p: Puppy }) {
  const img = cover(p);
  return (
    <li className="list-none">
      <Link href={paths.puppy(p.slug)} className="block no-underline">
        <TicketShape stub={<span className="[writing-mode:vertical-rl]">admit one</span>} className="transition-transform duration-300 hover:-rotate-1">
          <div className="flex items-center gap-4">
            <span className="block size-20 shrink-0 overflow-hidden rounded-full border-2 border-cocoa">
              {img && <PlaceholderImage width={img.width} height={img.height} color={img.color} alt={img.alt} className="size-full" />}
            </span>
            <span>
              <span className="block font-[family-name:var(--font-display)] text-2xl font-extrabold text-cocoa">{p.name}</span>
              <span className="block text-base">{p.breed} · {SEX_LABEL[p.sex]}</span>
              <span className="block text-sm text-toffee-ink">{p.source ?? 'TeddyPups'} · home ♥</span>
            </span>
          </div>
        </TicketShape>
      </Link>
    </li>
  );
}

export function GoneHomeView({ puppies, whatsappUrl }: { puppies: readonly Puppy[]; whatsappUrl: string }) {
  return (
    <main id="main" style={{ background: 'var(--scene-2)' }}>
      <Container className="py-14">
        <Kicker>they found their people</Kicker>
        <h1 className="mt-4 text-5xl md:text-8xl">Gone home</h1>
        <p className="mt-4 max-w-xl text-xl">{puppies.length} puppies have gone home with loving families. Each ticket is a happy ending.</p>
        <ul className="m-0 mt-10 grid gap-6 p-0 md:grid-cols-2 xl:grid-cols-3">{puppies.map((p) => <Ticket key={p.slug} p={p} />)}</ul>
        <div className="mt-12 flex flex-wrap gap-3">
          <Button href={paths.puppies()}>See available puppies</Button>
          <Button href={whatsappUrl} variant="whatsapp" target="_blank" rel="noopener noreferrer">Ask for a puppy like these</Button>
        </div>
      </Container>
    </main>
  );
}
