import type { Metadata } from 'next';
import { FaqView } from '@modules/content';
import { getContainer } from '@composition';

export const metadata: Metadata = { title: 'Questions & answers', description: 'Answers about health checks, visits, imports and delivery.' };

export default async function FaqPage() {
  const { content } = getContainer();
  const [faqs, settings] = await Promise.all([content.listFaqs(), content.getSettings()]);
  return <FaqView faqs={faqs} whatsappUrl={settings.whatsappHref} />;
}
