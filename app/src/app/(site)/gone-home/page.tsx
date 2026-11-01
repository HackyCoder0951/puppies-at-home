import type { Metadata } from 'next';
import { GoneHomeView } from '@modules/catalog';

export const metadata: Metadata = { title: 'Gone home', description: 'Puppies that have found their forever families.' };

export default function GoneHomePage() {
  return <GoneHomeView />;
}
