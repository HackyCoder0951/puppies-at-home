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

export async function moveEnquiryAction(id: string, to: string): Promise<{ ok: boolean; message: string }> {
  const result = await (await getInbox()).setStatus(id, to);
  return result.ok ? { ok: true, message: 'Enquiry moved.' } : { ok: false, message: inboxMessage(result.error) };
}

/** Bulk change from the table: a status and/or an owner for every ticked enquiry. Each row is still checked by the database. */
export async function bulkEnquiriesAction(_prev: FormState, form: FormData): Promise<FormState> {
  const ids = form.getAll('ids').map(String).filter(Boolean).slice(0, 100);
  if (ids.length === 0) return { error: 'Tick at least one enquiry.' };
  const status = text(form, 'status');
  const assignee = text(form, 'assignee');
  if (!status && !assignee) return { error: 'Choose a status or an owner to apply.' };
  const inbox = await getInbox();
  let done = 0;
  let failed = 0;
  for (const id of ids) {
    const results = [];
    if (status) results.push(await inbox.setStatus(id, status));
    if (assignee) results.push(await inbox.assign(id, assignee === 'none' ? null : assignee));
    if (results.every((r) => r.ok)) done += 1; else failed += 1;
  }
  return failed ? { error: `${done} updated, ${failed} could not be changed (your role or the record state does not allow it).` } : { notice: `${done} enquiries updated.` };
}
