import type { Metadata } from 'next';
import { FamiliesView } from '@modules/content';
import { getContainer } from '@composition';

export const metadata: Metadata = { title: 'Happy families', description: 'Photos from families who brought a TeddyPups puppy home.' };

export default async function HappyFamiliesPage() {
  const photos = await getContainer().content.listFamilyPhotos();
  return <FamiliesView photos={photos} />;
}
