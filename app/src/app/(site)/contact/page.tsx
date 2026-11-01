import type { Metadata } from 'next';
import { ContactView } from '@modules/content';
import { LetterForm } from '@modules/crm';
import { getContainer } from '@composition';
import { getEnv } from '@shared/config';
import { submitEnquiryAction } from '../enquiry-action';

export const metadata: Metadata = { title: 'Visit & contact', description: 'Visit TeddyPups in Downtown Dubai or get in touch on WhatsApp, by phone or email.' };

export default async function ContactPage() {
  const settings = await getContainer().content.getSettings();
  const form = (
    <LetterForm puppyOptions={settings.contactFormPuppyOptions} submit={submitEnquiryAction} whatsappHref={settings.whatsappHref} consentVersion={getEnv().CONSENT_TEXT_VERSION} />
  );
  return <ContactView settings={settings} form={form} />;
}
