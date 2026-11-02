'use server';

import { messagingMessage } from '@backend/modules/messaging';
import { getMessaging } from '@composition';
import type { FormState } from '../actions';

const text = (form: FormData, key: string) => String(form.get(key) ?? '');
const done = (result: { ok: true } | { ok: false; error: Parameters<typeof messagingMessage>[0] }, notice: string): FormState => (result.ok ? { notice } : { error: messagingMessage(result.error) });

export async function markAllReadAction(): Promise<FormState> {
  return done(await (await getMessaging()).markAllRead(), 'All notifications marked as read.');
}

export async function saveTemplateAction(key: string, channel: string, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getMessaging()).saveTemplate(key, channel, text(form, 'subject'), text(form, 'body'));
  return result.ok ? { notice: `Saved as version ${result.value} and activated.` } : { error: messagingMessage(result.error) };
}

export async function activateVersionAction(key: string, channel: string, _prev: FormState, form: FormData): Promise<FormState> {
  return done(await (await getMessaging()).activateVersion(key, channel, Number(text(form, 'version'))), 'Version activated.');
}

export async function setRuleAction(ruleId: string, enabled: boolean): Promise<FormState> {
  return done(await (await getMessaging()).setRuleEnabled(ruleId, enabled), enabled ? 'Rule enabled.' : 'Rule disabled.');
}

/** Manual send from a customer or order page: email goes through the outbox; WhatsApp returns a prefilled link. */
export async function sendManualAction(customerId: string, orderId: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getMessaging()).sendManual(customerId, orderId, text(form, 'template'), text(form, 'channel'));
  if (!result.ok) return { error: messagingMessage(result.error) };
  return result.value.kind === 'queued' ? { notice: 'Queued. It is sent within a minute and appears in the message log.' } : { notice: `WhatsApp link ready: ${result.value.url}` };
}
