'use server';

import { headers } from 'next/headers';
import { getContainer } from '@composition';

/** Server action behind both enquiry forms; the caller key is the forwarded IP (memory only in the mock). */
export async function submitEnquiryAction(input: unknown) {
  const h = await headers();
  const caller = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  return getContainer().enquiries.submit(input, caller);
}
