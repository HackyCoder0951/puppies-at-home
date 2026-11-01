import type { Metadata } from 'next';
import { GoneHomeView } from '@modules/catalog';
import { getContainer } from '@composition';

export const metadata: Metadata = { title: 'Gone home', description: 'Puppies that have found their forever families.' };

export default async function GoneHomePage() {
  const { catalog, content } = getContainer();
  const [puppies, settings] = await Promise.all([catalog.listGoneHome(), content.getSettings()]);
  return <GoneHomeView puppies={puppies} whatsappUrl={settings.whatsappHref} />;
}
