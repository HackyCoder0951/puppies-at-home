import type { Metadata } from 'next';
import { ContactView } from '@modules/content';
import { getContainer } from '@composition';

export const metadata: Metadata = { title: 'Visit & contact', description: 'Visit TeddyPups in Downtown Dubai or get in touch on WhatsApp, by phone or email.' };

export default async function ContactPage() {
  const settings = await getContainer().content.getSettings();
  return <ContactView settings={settings} form={<p>Contact form arrives in phase F5.</p>} />;
}
