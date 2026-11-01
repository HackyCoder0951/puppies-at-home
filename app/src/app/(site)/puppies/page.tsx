import type { Metadata } from 'next';
import { parseFilter, PuppiesView } from '@modules/catalog';
import { getContainer } from '@composition';

export const metadata: Metadata = {
  title: 'Puppies',
  description: 'Meet the teacup and teddy bear puppies looking for a home in Dubai.',
};

export default async function PuppiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filter = parseFilter(await searchParams);
  const { catalog, content } = getContainer();
  const [listing, settings] = await Promise.all([catalog.listPuppies(filter), content.getSettings()]);
  return <PuppiesView listing={listing} filter={filter} whatsappUrl={settings.whatsappHref} />;
}
