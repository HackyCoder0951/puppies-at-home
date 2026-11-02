'use server';

import { inboxMessage } from '@backend/modules/inbox';
import { getInbox } from '@composition';
import type { FormState } from '../actions';

const text = (form: FormData, key: string) => String(form.get(key) ?? '');

export async function enquiryStatusAction(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getInbox()).setStatus(id, text(form, 'status'));
  return result.ok ? { notice: 'Status updated.' } : { error: inboxMessage(result.error) };
}

export async function assignEnquiryAction(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getInbox()).assign(id, text(form, 'assignee') || null);
  return result.ok ? { notice: 'Assignment saved.' } : { error: inboxMessage(result.error) };
}

export async function addNoteAction(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getInbox()).addNote(id, text(form, 'body'));
  return result.ok ? { notice: 'Note added.' } : { error: inboxMessage(result.error) };
}

export async function updateCustomerAction(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getInbox()).updateCustomer(id, { fullName: text(form, 'fullName'), email: text(form, 'email'), area: text(form, 'area'), notes: text(form, 'notes'), tags: text(form, 'tags') });
  return result.ok ? { notice: 'Saved.' } : { error: inboxMessage(result.error) };
}
