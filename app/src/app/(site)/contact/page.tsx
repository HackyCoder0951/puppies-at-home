import type { Metadata } from 'next';
import { ContactView } from '@modules/content';
import { EnquiryForm } from '@modules/crm';
import { getContainer } from '@composition';
import { getEnv } from '@shared/config';
import { submitEnquiryAction } from '../enquiry-action';

export const metadata: Metadata = { title: 'Visit & contact', description: 'Visit TeddyPups in Downtown Dubai or get in touch on WhatsApp, by phone or email.' };

export default async function ContactPage() {
  const settings = await getContainer().content.getSettings();
  return <ContactView settings={settings} form={
    <EnquiryForm source="contact" submit={submitEnquiryAction} submitLabel="Post my letter" consentVersion={getEnv().CONSENT_TEXT_VERSION} sourcePage="/contact"
      whatsappUrl={settings.whatsappHref} puppyOptions={settings.contactFormPuppyOptions} />
  } />;
}
