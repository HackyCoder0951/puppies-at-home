'use server';

import { redirect } from 'next/navigation';
import { billingMessage } from '@backend/modules/billing';
import { getBilling } from '@composition';
import { adminPaths } from '@nav';
import type { FormState } from '../actions';

const text = (form: FormData, key: string) => String(form.get(key) ?? '');
const done = (result: { ok: true } | { ok: false; error: Parameters<typeof billingMessage>[0] }, notice: string): FormState => (result.ok ? { notice } : { error: billingMessage(result.error) });

export async function createInvoiceAction(orderId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getBilling()).createInvoice(orderId, text(form, 'dueAt'), text(form, 'notes'));
  if (!result.ok) return { error: billingMessage(result.error) };
  redirect(adminPaths.invoice(result.value));
}

export async function updateDraftAction(invoiceId: string, _prev: FormState, form: FormData): Promise<FormState> {
  return done(await (await getBilling()).updateDraft(invoiceId, text(form, 'dueAt'), text(form, 'notes')), 'Saved.');
}

export async function issueInvoiceAction(invoiceId: string, _prev: FormState, form: FormData): Promise<FormState> {
  return done(await (await getBilling()).issueInvoice(invoiceId, text(form, 'dueAt')), 'Invoice issued.');
}

export async function voidInvoiceAction(invoiceId: string, _prev: FormState, form: FormData): Promise<FormState> {
  return done(await (await getBilling()).voidInvoice(invoiceId, text(form, 'reason')), 'Invoice voided.');
}

/** `reference` is the idempotency key: the form renders a fresh one, so a double submit cannot record twice. */
export async function recordPaymentAction(orderId: string, invoiceId: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getBilling()).recordPayment({ orderId, invoiceId, reference: text(form, 'reference'), method: text(form, 'method'), amountMinor: text(form, 'amount'), note: text(form, 'note') });
  if (!result.ok) return { error: billingMessage(result.error) };
  return { notice: result.value.duplicate ? 'That payment reference was already recorded; nothing changed.' : 'Payment recorded.' };
}

export async function requestRefundAction(paymentId: string, _prev: FormState, form: FormData): Promise<FormState> {
  return done(await (await getBilling()).requestRefund({ paymentId, amountMinor: text(form, 'amount'), reason: text(form, 'reason') }), 'Refund requested; a super admin must approve it.');
}

export async function decideRefundAction(refundId: string, _prev: FormState, form: FormData): Promise<FormState> {
  return done(await (await getBilling()).decideRefund(refundId, text(form, 'decision') === 'approve', text(form, 'note')), 'Decision saved.');
}

export async function setTaxRateAction(_prev: FormState, form: FormData): Promise<FormState> {
  return done(await (await getBilling()).setDefaultTaxRate({ name: text(form, 'name'), percent: text(form, 'percent') }), 'New orders will use this rate.');
}
