import type { Metadata } from 'next';
import { FaqView } from '@modules/content';
import { getContainer } from '@composition';

export const metadata: Metadata = { title: 'Questions & answers', description: 'Answers about health checks, visits, imports and delivery.' };

export default async function FaqPage() {
  return <FaqView faqs={await getContainer().content.listFaqs()} />;
}
