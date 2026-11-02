'use server';

import { privacyMessage } from '@backend/modules/privacy';
import { getPrivacy } from '@composition';
import type { FormState } from '../actions';

const text = (form: FormData, key: string) => String(form.get(key) ?? '');
const done = (result: { ok: true } | { ok: false; error: Parameters<typeof privacyMessage>[0] }, notice: string): FormState => (result.ok ? { notice } : { error: privacyMessage(result.error) });

export async function createRequestAction(_prev: FormState, form: FormData): Promise<FormState> {
  return done(await (await getPrivacy()).createRequest({ type: text(form, 'type'), requester: text(form, 'requester'), contact: text(form, 'contact'), details: text(form, 'details'), customerId: text(form, 'customerId') || null }), 'Request logged. The 30-day clock has started.');
}

export async function updateRequestAction(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  return done(await (await getPrivacy()).updateRequest(id, text(form, 'status'), text(form, 'exceptions'), form.get('verified') === 'on' ? true : null), 'Request updated.');
}

export async function restrictAction(customerId: string, restricted: boolean): Promise<FormState> {
  return done(await (await getPrivacy()).restrict(customerId, restricted), restricted ? 'Processing restricted: no messages will be sent.' : 'Restriction lifted.');
}

export async function withdrawConsentAction(customerId: string, purpose: string): Promise<FormState> {
  const result = await (await getPrivacy()).withdrawConsent(customerId, purpose);
  return result.ok ? { notice: `Consent withdrawn (${result.value} record(s)).` } : { error: privacyMessage(result.error) };
}

export async function anonymiseAction(customerId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getPrivacy()).anonymiseSubject(customerId, text(form, 'requestId') || null, text(form, 'confirm'));
  return result.ok ? { notice: `Anonymised. Orders, invoices and payments were kept for legal reasons; free text was removed (${JSON.stringify(result.value)}).` } : { error: privacyMessage(result.error) };
}

export async function createIncidentAction(_prev: FormState, form: FormData): Promise<FormState> {
  return done(await (await getPrivacy()).createIncident({ detectedAt: text(form, 'detectedAt'), awareAt: text(form, 'awareAt'), summary: text(form, 'summary'), dataCategories: text(form, 'dataCategories'), peopleAffected: text(form, 'peopleAffected'), riskLevel: text(form, 'riskLevel') }), 'Incident recorded. The 72-hour clock runs from the time you became aware.');
}

export async function updateIncidentAction(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const iso = (key: string) => (text(form, key) ? new Date(text(form, key)).toISOString() : null);
  return done(await (await getPrivacy()).updateIncident(id, { status: text(form, 'status'), riskLevel: text(form, 'riskLevel'), authorityNotifiedAt: iso('authorityNotifiedAt'), individualsNotifiedAt: iso('individualsNotifiedAt'), decisionReason: text(form, 'decisionReason') || null }), 'Incident updated.');
}
