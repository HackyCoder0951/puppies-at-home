'use server';

import { getStaffAdmin } from '@composition';
import type { FormState } from '../actions';

const text = (form: FormData, key: string) => String(form.get(key) ?? '');
const MESSAGES = { forbidden: 'Only a super admin can do that.', exists: 'That email already has an account.', unavailable: 'Could not complete that right now. Try again shortly.' } as const;
const failure = (e: { code: string; message?: string; field?: string }): FormState => ({ error: e.code === 'rule' ? (e.message ?? 'Not allowed.') : e.code === 'invalid' ? `Check this field: ${e.field}.` : (MESSAGES[e.code as keyof typeof MESSAGES] ?? 'Not allowed.') });

export async function inviteStaffAction(_prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getStaffAdmin()).invite({ email: text(form, 'email'), fullName: text(form, 'fullName'), role: text(form, 'role') });
  return result.ok ? { notice: 'Invitation sent. They set their password from the email link.' } : failure(result.error);
}

export async function updateStaffAction(userId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const admin = await getStaffAdmin();
  for (const result of [await admin.setRole(userId, text(form, 'role')), await admin.setDisabled(userId, form.get('disabled') === 'on'), await admin.setMfaRequired(userId, form.get('mfa') === 'on')]) {
    if (!result.ok) return failure(result.error);
  }
  return { notice: 'Saved.' };
}
