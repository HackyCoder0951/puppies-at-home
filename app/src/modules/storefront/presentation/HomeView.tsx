import Link from 'next/link';
import { paths } from '@nav';
import type { Puppy } from '@modules/catalog';
import type { Faq, FamilyPhoto, Testimonial } from '@modules/content';
import { Button, Card, Container, Kicker, Mascot, NoteShape, PlaceholderImage, Polaroid, SectionNumber, ShieldIcon, HeartIcon, TruckIcon, ChatIcon } from '@shared/ui';
import { Scene } from './Scene';

export interface HomeData {
  readonly puppies: readonly Puppy[];
  readonly faqs: readonly Faq[];
  readonly photos: readonly FamilyPhoto[];
  readonly testimonial: Testimonial;
  readonly whatsappUrl: string;
}

const trust = [
  [ShieldIcon, 'Health certified', 'Every puppy is vaccinated, dewormed and checked by licensed vets.'],
  [HeartIcon, 'Raised with love', 'Well-socialised puppies from trusted breeders and our own showroom.'],
  [TruckIcon, 'Safe delivery', 'Collection, delivery and airport pick-up across the U.A.E.'],
  [ChatIcon, 'Always here', 'Real photos, video and support on WhatsApp, day and night.'],
] as const;

const journey = [
  ['Say hello', 'Tell us about the puppy you dream of on WhatsApp.'],
  ['See the details', 'We send real photos, video and health papers.'],
  ['Welcome home', 'Collect or have your puppy delivered, with support after.'],
] as const;

export function HomeView({ data }: { data: HomeData }) {
  const { puppies, faqs, photos, testimonial, whatsappUrl } = data;
  return (
    <main id="main">
      <Scene gradient="1" className="pb-20 pt-10 text-center">
        <Container>
          <Kicker>every puppy is family</Kicker>
          <h1 className="mx-auto mt-6 max-w-4xl text-[clamp(2.75rem,5.9vw,7.4rem)]">Premium teacup puppies in Dubai</h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl">Teddy bear and teacup puppies, raised with love, with real photos and health papers before you decide.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href={paths.puppies()}>Meet the pups</Button>
            <Button href={paths.howItWorks()} variant="ghost">How it works</Button>
          </div>
          <ul className="m-0 mt-14 flex list-none items-end justify-center gap-4 p-0">
            {puppies.slice(0, 5).map((p, i) => {
              const m = p.media[0];
              return m ? (
                <li key={p.slug} className="hidden w-32 overflow-hidden border-[3px] border-cocoa [border-radius:999px_999px_0_0] first:block even:block md:block" style={{ marginBottom: i % 2 ? 0 : 16 }}>
                  <PlaceholderImage width={m.width} height={m.height} color={m.color} alt={m.alt} className="w-full" />
                </li>
              ) : null;
            })}
          </ul>
        </Container>
      </Scene>

      <Scene gradient="2" className="py-20" id="meet">
        <Container>
          <SectionNumber value={1} />
          <h2 className="text-5xl md:text-7xl">Meet the pups</h2>
          <ul className="m-0 mt-8 grid list-none grid-cols-2 gap-5 p-0 md:grid-cols-4">
            {puppies.slice(0, 4).map((p, i) => {
              const m = p.media[0];
              return (
                <li key={p.slug}>
                  <Link href={paths.puppy(p.slug)} className="block no-underline">
                    <Card className="overflow-hidden" tilt={i % 2 ? 1 : -1}>
                      {m && <PlaceholderImage width={m.width} height={m.height} color={m.color} alt={m.alt} className="w-full" />}
                      <p className="p-4 font-[family-name:var(--font-display)] text-xl font-extrabold text-cocoa">{p.name}</p>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-8"><Button href={paths.puppies()}>See all puppies</Button></div>
        </Container>
      </Scene>

      <Scene gradient="3" className="py-20">
        <Container>
          <SectionNumber value={2} />
          <h2 className="text-5xl md:text-7xl">Two ways to meet your puppy</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="p-8"><h3 className="text-3xl">Meet local puppies</h3><p className="mt-2">Visit our Downtown Dubai showroom and spend time with the pups.</p><div className="mt-5"><Button href={paths.puppies({ origin: 'local' })}>Meet local puppies</Button></div></Card>
            <Card className="p-8"><h3 className="text-3xl">Order an imported puppy</h3><p className="mt-2">We find a rare breed from a trusted breeder and bring them home to you.</p><div className="mt-5"><Button href={paths.puppies({ origin: 'imported' })}>See imported puppies</Button></div></Card>
          </div>
        </Container>
      </Scene>

      <Scene gradient="4" className="py-20">
        <Container>
          <SectionNumber value={3} />
          <h2 className="text-5xl md:text-7xl">Your puppy journey</h2>
          <ol className="m-0 mt-8 grid list-none gap-5 p-0 md:grid-cols-3">
            {journey.map(([t, d], i) => <li key={t}><Card kind="step" className="h-full p-6"><SectionNumber value={i + 1} /><h3 className="mt-2 text-3xl">{t}</h3><p className="mt-2">{d}</p></Card></li>)}
          </ol>
        </Container>
      </Scene>

      <Scene gradient="5" className="py-20">
        <Container>
          <SectionNumber value={4} />
          <h2 className="text-5xl text-milk md:text-7xl">Why families trust TeddyPups</h2>
          <ul className="m-0 mt-8 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map(([Icon, t, d]) => <li key={t}><Card className="h-full p-6"><Icon className="text-toffee-deep" /><h3 className="mt-3 text-2xl">{t}</h3><p className="mt-2 text-base">{d}</p></Card></li>)}
          </ul>
        </Container>
      </Scene>

      <Scene gradient="6" dark className="py-20">
        <Container>
          <SectionNumber value={5} />
          <h2 className="text-5xl text-milk md:text-7xl">Happy families &amp; puppies</h2>
          <ul className="m-0 mt-8 flex list-none flex-wrap gap-6 p-0">
            {photos.slice(0, 4).map((p, i) => <li key={p.id} className="w-44"><Polaroid tilt={i % 2 ? 2 : -2}><PlaceholderImage width={p.width} height={p.height} color={p.color} alt={p.alt} className="w-full" /></Polaroid></li>)}
          </ul>
          <NoteShape tilt={-1} className="mt-10 max-w-2xl"><blockquote className="m-0 text-cocoa">{testimonial.quote}</blockquote></NoteShape>
          <div className="mt-8"><Button href={paths.families()} variant="ghost-on-dark">See the wall</Button></div>
        </Container>
      </Scene>

      <Scene gradient="7" dark className="py-20">
        <Container>
          <SectionNumber value={6} />
          <h2 className="text-5xl text-milk md:text-7xl">Questions, answered</h2>
          <ul className="m-0 mt-8 list-none space-y-3 p-0">
            {faqs.slice(0, 3).map((f) => <li key={f.question}><Link href={paths.faq()} className="text-xl text-honey underline">{f.question}</Link></li>)}
          </ul>
        </Container>
      </Scene>

      <Scene gradient="8" dark className="pb-28 pt-20 text-center">
        <Container>
          <Mascot className="mx-auto size-28" title="Mascot waving" />
          <h2 className="mt-4 text-5xl text-milk md:text-7xl">Ready to meet your new best friend?</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href={paths.puppies()}>See puppies</Button>
            <Button href={whatsappUrl} variant="whatsapp" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</Button>
          </div>
        </Container>
      </Scene>
    </main>
  );
}
