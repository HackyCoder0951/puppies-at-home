import { HomeView } from '@modules/storefront';
import { getContainer } from '@composition';

export default async function HomePage() {
  const { puppies } = await getContainer().catalog.listPuppies();
  return <HomeView data={{ puppies }} />;
}
