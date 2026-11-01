import type { ReactNode } from 'react';
import { Button, Card, Container, Kicker } from '@shared/ui';
import type { SiteSettings } from '../domain';

/** `form` is the contact letter form, supplied by the page so this module does not depend on crm. */
export function ContactView({ settings, form }: { settings: SiteSettings; form: ReactNode }) {
  return (
    <main id="main" style={{ background: 'var(--scene-contact)' }}>
      <Container className="py-14">
        <Kicker>say hello</Kicker>
        <h1 className="mt-4 text-5xl md:text-8xl">Get in touch with us</h1>
        <p className="mt-4 max-w-xl text-xl">Visit the showroom, message us, or send a letter. We reply quickly.</p>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="order-2 flex flex-col gap-5 lg:order-1">
            <Button href={settings.whatsappHref} variant="whatsapp" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</Button>
            <Button href={settings.phoneHref} variant="ghost">Call us</Button>
            <Button href={`mailto:${settings.email}`} variant="ghost">{settings.email}</Button>
            <Card className="p-6">
              <h2 className="text-3xl">Visit us in Downtown Dubai</h2>
              <p className="mt-2">{settings.address}</p>
              <div className="mt-4"><Button href={settings.mapsHref} variant="ghost" target="_blank" rel="noopener noreferrer">Open in Google Maps</Button></div>
            </Card>
          </div>
          <div className="order-1 lg:order-2">{form}</div>
        </div>
      </Container>
    </main>
  );
}
