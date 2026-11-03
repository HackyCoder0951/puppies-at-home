'use server';

import { headers } from 'next/headers';
import { submitPrivacyRequest } from '@backend/modules/privacy';

export interface PrivacyRequestState { readonly done?: boolean; readonly error?: string }

const MESSAGES: Record<string, string> = { name: 'Please enter your name.', contact: 'Please enter an email address or phone number we can reach you on.', type: 'Please choose what you would like to ask for.', details: 'That message is too long (up to 2,000 characters).' };

/** Public privacy request: the caller key is the forwarded IP; the module checks the honeypot and the rate limit. */
export async function privacyRequestAction(_prev: PrivacyRequestState, form: FormData): Promise<PrivacyRequestState> {
  const h = await headers();
  const caller = h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const result = await submitPrivacyRequest(
    { name: form.get('name'), contact: form.get('contact'), type: form.get('type'), details: form.get('details'), website: form.get('website'), elapsedMs: Date.now() - Number(form.get('startedAt') ?? Date.now()) },
    caller,
  );
  if (result.ok) return { done: true };
  if (result.error.code === 'invalid') return { error: MESSAGES[result.error.field] ?? 'Please check the form and try again.' };
  if (result.error.code === 'rate-limited') return { error: 'You have sent several requests already. Please try again in a little while, or email us.' };
  return { error: 'Something went wrong on our side. Please try again, or email us.' };
}
