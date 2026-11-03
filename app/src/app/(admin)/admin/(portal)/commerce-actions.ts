'use server';

import { redirect } from 'next/navigation';
import { commerceMessage } from '@backend/modules/commerce';
import { getCommerce } from '@composition';
import { adminPaths } from '@nav';
import type { FormState } from '../actions';

const text = (form: FormData, key: string) => String(form.get(key) ?? '');
import { ITEM_ROWS } from './items';

/** Items come from fixed rows (`desc_i`, `qty_i`, `price_i`); empty rows are ignored. */
function readItems(form: FormData) {
  return Array.from({ length: ITEM_ROWS }, (_, i) => ({ description: text(form, `desc_${i}`), quantity: text(form, `qty_${i}`) || '1', unitMinor: text(form, `price_${i}`) }))
    .filter((row) => row.description.trim() || row.unitMinor.trim());
}

export async function createOrderAction(_prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getCommerce()).createOrder({
    customerId: text(form, 'customerId'), puppyId: text(form, 'puppyId') || null, enquiryId: text(form, 'enquiryId') || null, type: text(form, 'type'),
    items: readItems(form), depositMinor: text(form, 'deposit') || '0', notes: text(form, 'notes'),
  });
  if (!result.ok) return { error: commerceMessage(result.error) };
  redirect(adminPaths.order(result.value.id));
}

export async function setItemsAction(orderId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getCommerce()).setItems(orderId, { items: readItems(form), depositMinor: text(form, 'deposit') || null });
  return result.ok ? { notice: 'Items saved.' } : { error: commerceMessage(result.error) };
}

export async function orderNotesAction(orderId: string, assignedTo: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getCommerce()).updateOrder(orderId, text(form, 'notes'), assignedTo);
  return result.ok ? { notice: 'Saved.' } : { error: commerceMessage(result.error) };
}

export async function orderStatusAction(orderId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getCommerce()).transitionOrder(orderId, text(form, 'to'), text(form, 'reason'));
  return result.ok ? { notice: 'Status updated.' } : { error: commerceMessage(result.error) };
}

export async function createDeliveryAction(orderId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getCommerce()).createDelivery(orderId, { method: text(form, 'method'), carrier: text(form, 'carrier'), trackingNo: text(form, 'trackingNo'), addressText: text(form, 'addressText'), eta: text(form, 'eta') });
  return result.ok ? { notice: 'Delivery scheduled.' } : { error: commerceMessage(result.error) };
}

export async function deliveryStatusAction(deliveryId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const result = await (await getCommerce()).transitionDelivery(deliveryId, text(form, 'to'), text(form, 'note'), text(form, 'location'));
  return result.ok ? { notice: 'Delivery updated.' } : { error: commerceMessage(result.error) };
}

/** Drag-and-drop move on the orders board: the same database-checked transition as the status form. */
export async function moveOrderAction(id: string, to: string): Promise<{ ok: boolean; message: string }> {
  const result = await (await getCommerce()).transitionOrder(id, to, '');
  return result.ok ? { ok: true, message: 'Order moved.' } : { ok: false, message: commerceMessage(result.error) };
}

/** Bulk stage change from the orders table. Illegal moves (for example skipping a stage) are refused per order by the database. */
export async function bulkOrdersAction(_prev: FormState, form: FormData): Promise<FormState> {
  const ids = form.getAll('ids').map(String).filter(Boolean).slice(0, 100);
  if (ids.length === 0) return { error: 'Tick at least one order.' };
  const to = text(form, 'to');
  if (!to) return { error: 'Choose a stage to move the ticked orders to.' };
  const commerce = await getCommerce();
  let done = 0;
  let failed = 0;
  for (const id of ids) {
    const result = await commerce.transitionOrder(id, to, text(form, 'reason'));
    if (result.ok) done += 1; else failed += 1;
  }
  return failed ? { error: `${done} moved, ${failed} could not be moved (that stage is not allowed from their current stage).` } : { notice: `${done} orders updated.` };
}
