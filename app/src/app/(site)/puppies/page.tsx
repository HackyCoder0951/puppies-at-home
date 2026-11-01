import type { Metadata } from 'next';
import { parseFilter, PuppiesView } from '@modules/catalog';
import { getContainer } from '@composition';

export const metadata: Metadata = {
  title: 'Available puppies',
  description: 'Every listing shows real photos of the actual puppy. Open a profile to see them all, then ask us about them on WhatsApp.',
};

export default async function PuppiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filter = parseFilter(await searchParams);
  const { catalog, content } = getContainer();
  const [{ puppies, goneHomePreview }, settings] = await Promise.all([catalog.listPuppies(), content.getSettings()]);
  return <PuppiesView puppies={puppies} goneSlugs={goneHomePreview.map((p) => p.slug)} filter={filter} whatsappUrl={settings.whatsappHref} />;
}
