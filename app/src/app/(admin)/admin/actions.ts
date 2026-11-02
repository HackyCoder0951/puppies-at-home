'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getEnv } from '@shared/config';
import { getIdentity } from '@composition';
import { RESET_REQUESTED_MESSAGE, resetMessage, signInMessage } from '@backend/modules/identity';
import { adminPaths, safeAdminNext } from '@nav';
import { LANDING_PAGES } from './landing';

export interface FormState {
  readonly error?: string;
  readonly notice?: string;
  /** Echoed back so a failed submit does not clear the field (React resets uncontrolled forms after an action). */
  readonly email?: string;
}

async function caller() {
  const h = await headers();
  return { ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local', userAgent: h.get('user-agent') ?? undefined };
}

export async function signInAction(_prev: FormState, form: FormData): Promise<FormState> {
  const identity = await getIdentity();
  const email = String(form.get('email') ?? '');
  const result = await identity.signIn({ email, password: String(form.get('password') ?? '') }, await caller());
  if (!result.ok) return { error: signInMessage(result.error), email };
  const next = safeAdminNext(String(form.get('next') ?? ''));
  // Nobody asked for a specific page: open the landing page this person chose (if any).
  const landing = (await cookies()).get('adm-home')?.value;
  redirect(next === adminPaths.home() && landing && LANDING_PAGES.some((p) => p.path === landing) ? landing : next);
}

export async function signOutAction(): Promise<void> {
  await (await getIdentity()).signOut();
  redirect(adminPaths.login());
}

export async function requestResetAction(_prev: FormState, form: FormData): Promise<FormState> {
  const identity = await getIdentity();
  const redirectTo = new URL(adminPaths.authCallback(), getEnv().NEXT_PUBLIC_SITE_URL);
  redirectTo.searchParams.set('next', adminPaths.resetPassword());
  const email = String(form.get('email') ?? '');
  const result = await identity.requestPasswordReset({ email }, redirectTo.toString(), await caller());
  if (!result.ok) return { error: result.error.code === 'rate-limited' ? signInMessage(result.error) : 'Enter a valid email address.', email };
  return { notice: RESET_REQUESTED_MESSAGE };
}

export async function resetPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get('password') ?? '');
  if (password !== String(form.get('confirm') ?? '')) return { error: 'The two passwords do not match.' };
  const result = await (await getIdentity()).resetPassword(password);
  if (!result.ok) return { error: resetMessage(result.error) };
  redirect(adminPaths.home());
}

export async function verifyTotpAction(_prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getIdentity()).verifyTotp(String(form.get('code') ?? ''));
  if (!result.ok) return { error: result.error.code === 'no-factor' ? 'No authenticator is set up for this account.' : 'That code is not correct. Wait for the next one and try again.' };
  redirect(safeAdminNext(String(form.get('next') ?? '')));
}

export async function confirmTotpAction(factorId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getIdentity()).confirmTotp(factorId, String(form.get('code') ?? ''));
  if (!result.ok) return { error: 'That code is not correct. Check the time on your phone and try again.' };
  redirect(adminPaths.security());
}

export async function disableTotpAction(_prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getIdentity()).disableTotp(String(form.get('code') ?? ''));
  return result.ok ? { notice: 'The authenticator was removed.' } : { error: 'That code is not correct.' };
}

export async function setLandingAction(_prev: FormState, form: FormData): Promise<FormState> {
  const path = String(form.get('landing') ?? '');
  if (!LANDING_PAGES.some((p) => p.path === path)) return { error: 'Choose one of the pages in the list.' };
  (await cookies()).set('adm-home', path, { path: '/admin', maxAge: 31_536_000, httpOnly: true, sameSite: 'lax' });
  return { notice: 'Saved. You will land there after signing in on this browser.' };
}
