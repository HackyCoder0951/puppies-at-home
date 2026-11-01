import type { ReactNode } from 'react';
import { Button, Card, Container } from '@shared/ui';
import type { SiteSettings } from '../domain';

/** `form` is the contact letter form, supplied by the page so this module does not depend on crm. */
export function ContactView({ settings, form }: { settings: SiteSettings; form: ReactNode }) {
  return (
    <main id="main" style={{ background: 'var(--scene-contact)' }}>
      <Container className="py-14">
        <h1 className="mt-4 text-5xl md:text-8xl">Get in touch with us</h1>
        <p className="mt-4 max-w-xl text-xl">Have questions about our puppies or adoption process? Fill out the form, and our team will get back to you promptly. Whether ready to adopt or just seeking info, we&apos;d love to hear from you!</p>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="order-2 flex flex-col gap-5 lg:order-1">
            <Button href={settings.whatsappHref} variant="whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp +971 54 167 6733</Button>
            <Button href={settings.phoneHref} variant="ghost">call us +971 54 167 6733</Button>
            <Button href={`mailto:${settings.email}`} variant="ghost">email {settings.email}</Button>
            <Card className="p-6">
              <h2 className="text-3xl">Visit us in Downtown Dubai</h2>
              <p className="mt-2">Step into our Downtown Dubai showroom and experience the joy of choosing your puppy face-to-face.</p>
              <p className="mt-2 font-semibold text-cocoa">{settings.address}</p>
              <div className="mt-4"><Button href={settings.mapsHref} variant="ghost" target="_blank" rel="noopener noreferrer">Open in Google Maps</Button></div>
            </Card>
          </div>
          <div className="order-1 lg:order-2">{form}</div>
        </div>
      </Container>
    </main>
  );
}
