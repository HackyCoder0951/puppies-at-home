import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { puppyWhatsappText, PuppyDetailView } from '@modules/catalog';
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
  const { puppy } = detail;
  const { NEXT_PUBLIC_SITE_URL: siteUrl, CONSENT_TEXT_VERSION } = getEnv();
  const whatsappHref = whatsappLink(settings.whatsappNumber, puppyWhatsappText(puppy, `${siteUrl}/puppies/${puppy.slug}`));
  const form = (
    <EnquiryForm submit={submitEnquiryAction} puppyName={puppy.name} defaultMessage={puppy.enquiryPrefill} sourcePage={`/puppies/${puppy.slug}`} whatsappHref={whatsappHref} consentVersion={CONSENT_TEXT_VERSION} />
  );
  return <PuppyDetailView detail={detail} siteUrl={siteUrl} whatsappHref={whatsappHref} enquiry={form} />;
}
