import type { Metadata } from 'next';
import { HowItWorksView } from '@modules/content';
import { getContainer } from '@composition';

export const metadata: Metadata = { title: 'How it works', description: 'Two ways to bring a TeddyPups puppy home: meet in Dubai or import a rare breed.' };

export default async function HowItWorksPage() {
  const { content } = getContainer();
  const [settings, copy] = await Promise.all([content.getSettings(), content.getHowItWorks()]);
  return <HowItWorksView whatsappUrl={settings.whatsappHref} copy={copy} />;
}
