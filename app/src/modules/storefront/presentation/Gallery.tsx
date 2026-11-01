import {
  Breadcrumb, Button, Card, CalendarIcon, ChatIcon, Chip, Container, HeartIcon, Kicker, Logo, Mascot, NoteShape,
  PawIcon, PhoneFrame, PinIcon, Polaroid, Scallop, SectionNumber, ShieldIcon, Stamp, StatusTag, TicketShape,
  Toggle, TruckIcon, Wave,
} from '@shared/ui';

const swatches = ['milk', 'cocoa', 'cocoa-soft', 'toffee-deep', 'toffee', 'honey', 'honey-soft', 'whatsapp', 'night', 'door-1', 'door-2', 'door-3', 'door-4', 'door-5'];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-8" aria-labelledby={`g-${title}`}>
      <h2 id={`g-${title}`} className="mb-5 text-3xl">{title}</h2>
      <div className="flex flex-wrap items-start gap-5">{children}</div>
    </section>
  );
}

/** Development-only component gallery for visual checks against the tokens (F1 exit, M1). */
export function Gallery() {
  return (
    <main id="main">
      <Container className="py-10">
        <h1 className="text-6xl">Design system gallery</h1>
        <Kicker>tokens and primitives</Kicker>
        <Block title="Colours">
          {swatches.map((s) => (
            <div key={s} className="w-28 text-sm">
              <div className="h-16 rounded-xl border-2 border-cocoa" style={{ background: `var(--color-${s})` }} />
              {s}
            </div>
          ))}
        </Block>
        <Block title="Buttons">
          <Button href="/">Primary</Button>
          <Button href="/" variant="whatsapp">WhatsApp</Button>
          <Button href="/" variant="ghost">Ghost</Button>
          <span className="rounded-xl bg-night p-3"><Button href="/" variant="ghost-on-dark">On dark</Button></span>
        </Block>
        <Block title="Chips and tags">
          <Chip>All</Chip><Chip selected>Boy</Chip><Chip href="/">Link chip</Chip>
          <StatusTag tone="available">Available</StatusTag><StatusTag tone="home">Gone home</StatusTag>
          <Stamp>Reserved</Stamp><SectionNumber value={3} />
        </Block>
        <Block title="Navigation">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Puppies', href: '/' }, { label: 'Max' }]} />
          <Toggle pressed label="Sound" /><Toggle pressed={false} label="Motion" />
        </Block>
        <Block title="Cards and shapes">
          <Card className="w-72 p-5">Info card</Card>
          <Card kind="step" tilt={-1} className="w-72 p-5">Step card</Card>
          <NoteShape className="w-64">Pinned FAQ note</NoteShape>
          <TicketShape stub="No. 7" className="w-80">Visit ticket</TicketShape>
          <Polaroid caption="Placeholder photo" className="w-56"><div className="aspect-square bg-honey" /></Polaroid>
          <PhoneFrame><div className="h-32 rounded-2xl bg-honey-soft p-3">Chat preview</div></PhoneFrame>
        </Block>
        <Block title="Icons, logo, mascot">
          <PawIcon /><HeartIcon /><ShieldIcon /><TruckIcon /><ChatIcon /><CalendarIcon /><PinIcon />
          <Logo /><Mascot className="size-24" />
        </Block>
      </Container>
      <Scallop color="var(--color-honey-soft)" />
      <Wave />
    </main>
  );
}
