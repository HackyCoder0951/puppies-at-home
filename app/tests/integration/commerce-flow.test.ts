import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { createCommerce } from '@backend/modules/commerce/application';
import { SupabaseCommerceRepository } from '@backend/modules/commerce/infrastructure';

/** Opt-in (seeded local stack): the order and delivery flow through the real database as an operator and a super admin. */
const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const run = url && anon && service ? describe : describe.skip;

const stamp = Date.now();
const PASSWORD = `test-${stamp}-password`;

run('commerce against the database', () => {
  const admin = createClient(url ?? 'http://x', service ?? 'x', { auth: { persistSession: false } });
  const users: string[] = [];
  let operator: ReturnType<typeof createCommerce>;
  let superAdmin: ReturnType<typeof createCommerce>;
  let customerId = '';
  let puppyId = '';
  const orderIds: string[] = [];

  async function staff(label: string, role: 'operator' | 'super_admin') {
    const email = `${label}-${stamp}@dev.test`;
    const { data, error } = await admin.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true });
    if (error) throw error;
    users.push(data.user.id);
    await admin.from('profiles').insert({ user_id: data.user.id, full_name: `Staff ${label}`, role });
    const client = createClient(url ?? '', anon ?? '', { auth: { persistSession: false } });
    const { error: signIn } = await client.auth.signInWithPassword({ email, password: PASSWORD });
    if (signIn) throw signIn;
    return createCommerce(new SupabaseCommerceRepository(client));
  }

  beforeAll(async () => {
    operator = await staff('op', 'operator');
    superAdmin = await staff('sa', 'super_admin');
    const customer = await admin.from('customers').insert({ full_name: `Order Customer ${stamp}`, phone_e164: '+971500000777' }).select('id').single();
    customerId = customer.data?.id as string;
    const puppy = await admin.from('puppies').insert({ slug: `flow-pup-${stamp}`, breed: 'Maltipoo', sex: 'female', age_text: '2 months', origin: 'local', price_minor: 400000 }).select('id').single();
    puppyId = puppy.data?.id as string;
  });

  afterAll(async () => {
    for (const id of orderIds) {
      await admin.from('deliveries').delete().eq('order_id', id);
      await admin.from('orders').delete().eq('id', id);
    }
    await admin.from('puppies').delete().eq('id', puppyId);
    await admin.from('customers').delete().eq('id', customerId);
    for (const id of users) {
      await admin.from('profiles').delete().eq('user_id', id);
      await admin.auth.admin.deleteUser(id);
    }
  });

  it('creates an order, reserves the puppy and walks a local order to completion with a delivery', async () => {
    const created = await operator.createOrder({ customerId, puppyId, type: 'local', depositMinor: '1000', items: [{ description: 'Maltipoo puppy', quantity: 1, unitMinor: '4000' }, { description: 'Starter kit', quantity: 1, unitMinor: '150' }] });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    orderIds.push(created.value.id);
    expect(created.value.number).toMatch(/^TP-\d{4}-\d{6}$/);

    expect((await operator.createOrder({ customerId, puppyId, type: 'local', items: [{ description: 'Same puppy', quantity: 1, unitMinor: '1' }] })).ok).toBe(false);

    const bad = await operator.transitionOrder(created.value.id, 'delivered', '');
    expect(bad).toMatchObject({ ok: false, error: { code: 'rule' } });
    for (const to of ['confirmed', 'deposit_paid']) expect((await operator.transitionOrder(created.value.id, to, '')).ok).toBe(true);

    const delivery = await operator.createDelivery(created.value.id, { method: 'dubai_delivery', carrier: 'Own van', eta: '2026-11-20', addressText: 'Dubai Marina' });
    expect(delivery.ok).toBe(true);
    if (!delivery.ok) return;
    for (const to of ['packed', 'dispatched', 'in_transit', 'arrived', 'delivered']) expect((await operator.transitionDelivery(delivery.value, to, '', to === 'in_transit' ? 'Sheikh Zayed Road' : '')).ok).toBe(true);

    expect((await operator.transitionOrder(created.value.id, 'delivered', '')).ok).toBe(true);
    expect((await operator.transitionOrder(created.value.id, 'completed', '')).ok).toBe(true);

    const detail = await operator.getOrder(created.value.id);
    if (!detail.ok) throw new Error('read failed');
    expect(detail.value).toMatchObject({ status: 'completed', totalMinor: 415000, depositMinor: 100000, balanceMinor: 435750, customerName: `Order Customer ${stamp}` });
    expect(detail.value.events.map((e) => e.to)).toEqual(['new', 'confirmed', 'deposit_paid', 'delivered', 'completed']);
    expect(detail.value.deliveries[0]?.events.map((e) => e.status)).toEqual(['scheduled', 'packed', 'dispatched', 'in_transit', 'arrived', 'delivered']);
    const puppy = await admin.from('puppies').select('status').eq('id', puppyId).single();
    expect(puppy.data?.status).toBe('gone_home');
  });

  it('operators cannot cancel after the deposit; a super admin can with a reason, and the puppy is released', async () => {
    await admin.from('puppies').update({ status: 'available' }).eq('id', puppyId);
    const created = await operator.createOrder({ customerId, puppyId, type: 'imported', items: [{ description: 'Imported puppy', quantity: 1, unitMinor: '4000' }] });
    if (!created.ok) throw new Error('create failed');
    orderIds.push(created.value.id);
    for (const to of ['confirmed', 'deposit_paid']) await operator.transitionOrder(created.value.id, to, '');
    expect(await operator.transitionOrder(created.value.id, 'cancelled', 'customer withdrew')).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect(await superAdmin.transitionOrder(created.value.id, 'cancelled', '')).toMatchObject({ ok: false, error: { code: 'rule' } });
    expect((await superAdmin.transitionOrder(created.value.id, 'cancelled', 'customer withdrew')).ok).toBe(true);
    const puppy = await admin.from('puppies').select('status').eq('id', puppyId).single();
    expect(puppy.data?.status).toBe('available');
    const detail = await superAdmin.getOrder(created.value.id);
    expect(detail.ok && detail.value.cancelReason).toBe('customer withdrew');
  });
});
