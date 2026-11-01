import { HomeView } from '@modules/storefront';
import { getContainer } from '@composition';

export default async function HomePage() {
  const { catalog, content } = getContainer();
  const [listing, faqs, photos, testimonial, settings] = await Promise.all([
    catalog.listPuppies(), content.listFaqs(), content.listFamilyPhotos(), content.getTestimonial(), content.getSettings(),
  ]);
  return <HomeView data={{ puppies: listing.puppies, faqs, photos, testimonial, whatsappUrl: settings.whatsappHref }} />;
}
