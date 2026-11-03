import type { Metadata } from 'next';
import { LegalPage } from '@modules/storefront';
import { PrivacyRequestForm } from './PrivacyRequestForm';

export const metadata: Metadata = { title: 'Privacy request', robots: { index: false } };

export default function PrivacyRequestPage() {
  return (
    <LegalPage title="Ask about your information">
      <p>You can ask us to show, correct or delete the information we hold about you, or to stop using it. Tell us how to reach you and what you need. We reply within 3 days and finish within 30 days.</p>
      <PrivacyRequestForm />
    </LegalPage>
  );
}
