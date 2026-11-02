'use server';

import { redirect } from 'next/navigation';
import { cmsMessage } from '@backend/modules/cms';
import { getCms } from '@composition';
import { adminPaths } from '@nav';
import type { FormState } from '../actions';

const fields = (form: FormData, keys: readonly string[]) => Object.fromEntries(keys.map((k) => [k, String(form.get(k) ?? '')]));
const PUPPY_KEYS = ['name', 'breed', 'breeds', 'collections', 'sex', 'ageText', 'colour', 'origin', 'priceAed'] as const;

export async function createPuppyAction(_prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getCms()).createPuppy(fields(form, PUPPY_KEYS));
  if (!result.ok) return { error: cmsMessage(result.error) };
  redirect(adminPaths.puppy(result.value.id));
}

export async function updatePuppyAction(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getCms()).updatePuppy(id, fields(form, PUPPY_KEYS));
  return result.ok ? { notice: 'Saved.' } : { error: cmsMessage(result.error) };
}

/** One action for the status buttons so the page needs no client state: the button value names the change. */
export async function puppyStatusAction(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const cms = await getCms();
  const change = String(form.get('change') ?? '');
  const result =
    change === 'publish' ? await cms.publishPuppy(id, true)
    : change === 'unpublish' ? await cms.publishPuppy(id, false)
    : change === 'gone-home' ? await cms.markGoneHome(id, true, String(form.get('source')) === 'Dubai showroom' ? 'Dubai showroom' : 'TeddyPups')
    : change === 'available' ? await cms.markGoneHome(id, false)
    : change === 'delete' ? await cms.deletePuppy(id)
    : null;
  if (!result) return { error: 'Unknown action.' };
  if (!result.ok) return { error: cmsMessage(result.error) };
  if (change === 'delete') redirect(adminPaths.puppies());
  return { notice: 'Done.' };
}

export async function addMediaAction(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose a photo or video.' };
  const result = await (await getCms()).addPuppyMedia(id, { bytes: new Uint8Array(await file.arrayBuffer()), contentType: file.type, alt: String(form.get('alt') ?? '') });
  return result.ok ? { notice: 'Uploaded.' } : { error: cmsMessage(result.error) };
}

export async function mediaAction(puppyId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const cms = await getCms();
  const mediaId = String(form.get('mediaId') ?? '');
  const result = String(form.get('change')) === 'cover' ? await cms.setPuppyCover(puppyId, mediaId) : await cms.removePuppyMedia(mediaId);
  return result.ok ? { notice: 'Done.' } : { error: cmsMessage(result.error) };
}

export async function saveFaqAction(id: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getCms()).saveFaq(id, fields(form, ['question', 'answer']));
  return result.ok ? { notice: 'Saved.' } : { error: cmsMessage(result.error) };
}

export async function faqStatusAction(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const cms = await getCms();
  const change = String(form.get('change'));
  const result = change === 'delete' ? await cms.deleteFaq(id) : await cms.publishFaq(id, change === 'publish');
  return result.ok ? { notice: 'Done.' } : { error: cmsMessage(result.error) };
}

export async function saveSettingsAction(_prev: FormState, form: FormData): Promise<FormState> {
  const keys = ['whatsapp_number', 'whatsapp_text', 'phone_href', 'email', 'address', 'maps_href', 'instagram', 'tiktok', 'facebook'];
  const result = await (await getCms()).saveSettings(fields(form, keys));
  return result.ok ? { notice: 'Saved.' } : { error: cmsMessage(result.error) };
}

export async function saveTestimonialAction(_prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getCms()).saveTestimonial(fields(form, ['quote', 'author', 'location']), form.get('publish') === 'on');
  return result.ok ? { notice: 'Saved.' } : { error: cmsMessage(result.error) };
}
