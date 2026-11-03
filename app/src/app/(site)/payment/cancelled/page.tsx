import type { Metadata } from 'next';
import { LegalPage } from '@modules/storefront';

export const metadata: Metadata = { title: 'Payment not completed', robots: { index: false } };

export default function PaymentCancelledPage() {
  return (
    <LegalPage title="Payment not completed">
      <p>No payment was taken. You can use the same payment link again whenever you are ready, or ask us for a new one.</p>
    </LegalPage>
  );
}
