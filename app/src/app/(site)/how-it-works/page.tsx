import type { Metadata } from 'next';
import { HowItWorksView } from '@modules/content';

export const metadata: Metadata = { title: 'How it works', description: 'Two ways to bring a TeddyPups puppy home: meet in Dubai or import a rare breed.' };

export default function HowItWorksPage() {
  return <HowItWorksView />;
}
