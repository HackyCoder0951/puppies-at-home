import Link from 'next/link';
import { paths } from '@nav';
import type { Puppy } from '@modules/catalog';
import type { Faq, FamilyPhoto, Testimonial } from '@modules/content';
import { Button, Card, Container, Kicker, Mascot, NoteShape, PlaceholderImage, Polaroid, SectionNumber, ShieldIcon, HeartIcon, TruckIcon, ChatIcon } from '@shared/ui';
import { SEX_WORD } from '@modules/catalog';
import { Scene } from './Scene';

export interface HomeData {
  readonly puppies: readonly Puppy[];
  readonly faqs: readonly Faq[];
  readonly photos: readonly FamilyPhoto[];
  readonly testimonial: Testimonial;
  readonly whatsappUrl: string;
}

const trust = [
  [ShieldIcon, 'Vet-checked & healthy', 'Every puppy comes vaccinated, dewormed, and with a verified health certificate.'],
  [TruckIcon, 'Korea to Dubai, safely', 'Trusted breeders, safe travel, and premium care from start to finish.'],
  [ChatIcon, 'Support 24/7', 'Always here to help, from choosing your puppy to post-delivery support.'],
  [HeartIcon, 'Trusted by families worldwide', 'Puppies delivered to loving homes all around the world.'],
] as const;

const journey = [
  ['Choose your breed', "Select your preferred breed or tell us what you're looking for. We'll guide you based on availability and your lifestyle."],
  ['Get photos & details', 'Our team will share real photos, health details, and all necessary information directly on WhatsApp.'],
  ['Secure & safe delivery', 'Once confirmed, we handle everything professionally and ensure your puppy reaches you safely and stress-free.'],
] as const;

const caption = (p: Puppy) =>
  [p.hasPersonalName ? p.breed : null, SEX_WORD[p.sex], p.age, p.media.some((m) => m.kind === 'video') ? 'with video' : null].filter(Boolean).join(', ');

export function HomeView({ data }: { data: HomeData }) {
  const { puppies, faqs, photos, testimonial, whatsappUrl } = data;
  return (
    <main id="main">
      <Scene gradient="1" className="pb-20 pt-10 text-center">
        <Container>
          <Kicker>every puppy is family</Kicker>
          <h1 className="mx-auto mt-6 max-w-4xl text-[clamp(2.75rem,5.9vw,7.4rem)]">Premium teacup puppies in Dubai</h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl">Meet your new best friend in our Dubai showroom, or order a rare miniature breed from trusted breeders worldwide.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href={paths.puppies()}>View available puppies</Button>
            <Button href={whatsappUrl} variant="ghost" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp</Button>
          </div>
          <ul className="m-0 mt-14 flex list-none items-end justify-center gap-4 p-0">
            {puppies.slice(0, 6).map((p, i) => {
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
          <p className="mt-3 text-xl">Real puppies, real photos, looking for their families right now.</p>
          <ul className="m-0 mt-8 grid list-none grid-cols-2 gap-5 p-0 md:grid-cols-3 xl:grid-cols-5">
            {puppies.map((p, i) => {
              const m = p.media[0];
              return (
                <li key={p.slug}>
                  <Link href={paths.puppy(p.slug)} className="block no-underline">
                    <Card className="overflow-hidden" tilt={i % 2 ? 1 : -1}>
                      {m && <PlaceholderImage width={m.width} height={m.height} color={m.color} alt={m.alt} className="w-full" />}
                      <div className="p-4">
                        <p className="font-[family-name:var(--font-display)] text-xl font-extrabold text-cocoa">{p.name}</p>
                        <p className="text-sm">{caption(p)}</p>
                        <p className="mt-1 text-sm font-semibold text-toffee-deep">Available</p>
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-8"><Button href={paths.puppies()}>See all available puppies</Button></div>
        </Container>
      </Scene>

      <Scene gradient="3" className="py-20">
        <Container>
          <SectionNumber value={2} />
          <h2 className="text-5xl md:text-7xl">Two ways to meet your puppy</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="p-8"><p className="font-[family-name:var(--font-hand)] text-toffee-ink">In our showroom</p><h3 className="text-3xl">Puppies in Dubai</h3><p className="mt-2">See them, love them, take them home. Come meet our locally available puppies before you decide.</p><div className="mt-5"><Button href={paths.puppies({ origin: 'local' })}>Meet local puppies</Button></div></Card>
            <Card className="p-8"><p className="font-[family-name:var(--font-hand)] text-toffee-ink">Korea → Dubai</p><h3 className="text-3xl">Imported for you</h3><p className="mt-2">Exclusive Korean teacup puppies, delivered. Order from the world&apos;s most reputable breeders and let us handle the import.</p><div className="mt-5"><Button href={paths.puppies({ origin: 'imported' })}>See imported puppies</Button></div></Card>
          </div>
        </Container>
      </Scene>

      <Scene gradient="4" className="py-20">
        <Container>
          <SectionNumber value={3} />
          <h2 className="text-5xl md:text-7xl">Your puppy journey</h2>
          <p className="mt-3 max-w-2xl text-xl">A premium, step-by-step concierge experience. We make adoption simple, secure, and purely joyful.</p>
          <ol className="m-0 mt-8 grid list-none gap-5 p-0 md:grid-cols-3">
            {journey.map(([t, d], i) => <li key={t}><Card kind="step" className="h-full p-6"><SectionNumber value={i + 1} /><h3 className="mt-2 text-3xl">{t}</h3><p className="mt-2">{d}</p></Card></li>)}
          </ol>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={paths.howItWorks()}>How it works</Button>
            <Button href={whatsappUrl} variant="whatsapp" target="_blank" rel="noopener noreferrer">Say hello on WhatsApp</Button>
          </div>
        </Container>
      </Scene>

      <Scene gradient="5" className="py-20">
        <Container>
          <SectionNumber value={4} />
          <p className="font-[family-name:var(--font-hand)] text-xl text-milk">puppy passport</p>
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
          <p className="mt-3 max-w-3xl text-lg">We are truly honored to see our puppies become cherished members of loving families. These heartwarming moments have been shared by our valued clients who welcomed a Teddy Pup into their homes and hearts.</p>
          <NoteShape tilt={-1} className="mt-8 max-w-2xl"><blockquote className="m-0 text-cocoa">{testimonial.quote}</blockquote><p className="mt-2 font-[family-name:var(--font-hand)] text-toffee-ink">{testimonial.attribution}</p></NoteShape>
          <ul className="m-0 mt-10 flex list-none flex-wrap gap-6 p-0">
            {photos.slice(0, 8).map((p, i) => <li key={p.id} className="w-40"><Polaroid tilt={i % 2 ? 2 : -2} caption={p.caption}><PlaceholderImage width={p.width} height={p.height} color={p.color} alt={p.alt} className="w-full" /></Polaroid></li>)}
          </ul>
          <div className="mt-8"><Button href={paths.families()} variant="ghost-on-dark">See every happy family</Button></div>
        </Container>
      </Scene>

      <Scene gradient="7" dark className="py-20">
        <Container>
          <SectionNumber value={6} />
          <h2 className="text-5xl text-milk md:text-7xl">Questions, answered</h2>
          <ul className="m-0 mt-8 list-none space-y-5 p-0">
            {faqs.slice(0, 3).map((f) => <li key={f.question}><p className="text-xl font-semibold text-honey">{f.question}</p><p className="mt-1">{f.answer}</p></li>)}
          </ul>
          <div className="mt-8"><Button href={paths.faq()} variant="ghost-on-dark">Read all questions</Button></div>
        </Container>
      </Scene>

      <Scene gradient="8" dark className="pb-28 pt-20 text-center">
        <Container>
          <Mascot className="mx-auto size-28" title="Mascot waving" />
          <p className="font-[family-name:var(--font-hand)] text-xl text-honey">welcome home</p>
          <h2 className="mt-2 text-5xl text-milk md:text-7xl">Ready to meet your new best friend?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg">Bring home a healthy, happy teacup or designer puppy with expert guidance every step of the way. We help you find the right match and ensure a smooth, safe delivery across the UAE.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href={whatsappUrl} variant="whatsapp" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp</Button>
            <Button href={paths.contact()} variant="ghost-on-dark">Visit &amp; contact</Button>
          </div>
        </Container>
      </Scene>
    </main>
  );
}
