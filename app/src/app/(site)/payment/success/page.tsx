import type { Metadata } from 'next';
import { LegalPage } from '@modules/storefront';

export const metadata: Metadata = { title: 'Payment received', robots: { index: false } };

export default function PaymentSuccessPage() {
  return (
    <LegalPage title="Thank you">
      <p>Your payment went through to our payment provider. We are confirming it now, and you will get a receipt by email as soon as it is confirmed. This usually takes a minute or two.</p>
      <p>If you do not hear from us within a day, message us on WhatsApp or by email with your order number.</p>
    </LegalPage>
  );
}
