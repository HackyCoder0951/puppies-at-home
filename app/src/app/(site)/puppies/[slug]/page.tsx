import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PuppyDetailView } from '@modules/catalog';
import { whatsappLink } from '@modules/content';
import { EnquiryForm } from '@modules/crm';
import { getContainer } from '@composition';
import { getEnv } from '@shared/config';
import { submitEnquiryAction } from '../../enquiry-action';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getContainer().catalog.listSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await getContainer().catalog.getPuppy((await params).slug);
  return detail ? { title: detail.puppy.metaTitle, description: detail.puppy.metaDescription } : {};
}

export default async function PuppyPage({ params }: Props) {
  const { catalog, content } = getContainer();
  const [detail, settings] = await Promise.all([catalog.getPuppy((await params).slug), content.getSettings()]);
  if (!detail) notFound();
  const whatsappFor = (text: string) => whatsappLink(settings.whatsappNumber, text);
  const { puppy } = detail;
  const form = (
    <EnquiryForm source="puppy" submit={submitEnquiryAction} submitLabel="Send enquiry" consentVersion={getEnv().CONSENT_TEXT_VERSION}
      sourcePage={`/puppies/${puppy.slug}`} whatsappUrl={settings.whatsappHref} defaultMessage={puppy.enquiryPrefill} fixedPuppy={puppy.name} />
  );
  return <PuppyDetailView detail={detail} whatsappFor={whatsappFor} enquiry={form} />;
}
