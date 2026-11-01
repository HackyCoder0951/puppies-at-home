import type { Metadata } from 'next';
import { LegalPage } from '@modules/storefront';

export const metadata: Metadata = { title: 'Privacy' };

export default function PrivacyPage() {
  return <LegalPage title="Privacy" />;
}
