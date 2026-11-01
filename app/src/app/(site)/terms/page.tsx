import type { Metadata } from 'next';
import { LegalPage } from '@modules/storefront';

export const metadata: Metadata = { title: 'Terms' };

export default function TermsPage() {
  return <LegalPage title="Terms" />;
}
