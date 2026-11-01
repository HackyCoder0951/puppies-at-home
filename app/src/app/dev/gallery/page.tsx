import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Gallery } from '@modules/storefront';
import { getEnv } from '@shared/config';

export const metadata: Metadata = { title: 'Gallery', robots: { index: false, follow: false } };

export default function GalleryPage() {
  if (getEnv().APP_ENV === 'production') notFound();
  return <Gallery />;
}
