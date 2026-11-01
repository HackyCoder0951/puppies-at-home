import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PuppyDetailView } from '@modules/catalog';
import { whatsappLink } from '@modules/content';
import { getContainer } from '@composition';

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
  return <PuppyDetailView detail={detail} whatsappFor={whatsappFor} enquiry={<p>Enquiry form arrives in phase F5.</p>} />;
}
