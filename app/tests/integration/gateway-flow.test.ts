import Stripe from 'stripe';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { createBilling, handleGatewayWebhook, registryOf } from '@backend/modules/billing/application';
import { StripeGateway, SupabaseBillingRepository, SupabaseGatewayLedger } from '@backend/modules/billing/infrastructure';
import { createCommerce } from '@backend/modules/commerce/application';
import { SupabaseCommerceRepository } from '@backend/modules/commerce/infrastructure';

/** Opt-in (seeded local stack): hosted payment link, signed webhook, replay, and a gateway refund (AC-017, T-PAY-02). */
const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const run = url && anon && service ? describe : describe.skip;

const stamp = Date.now();
const SECRET = 'whsec_integration_test_secret_0123456789';
const stripe = new Stripe('sk_test_integration');
const sign = (body: string) => stripe.webhooks.generateTestHeaderString({ payload: body, secret: SECRET });
const completed = (id: string, sessionId: string, amount: number, status = 'paid') =>
  JSON.stringify({ id, object: 'event', type: 'checkout.session.completed', created: Math.floor(Date.now() / 1000), api_version: '2026-01-01', data: { object: { id: sessionId, object: 'checkout.session', payment_status: status, amount_total: amount, currency: 'aed', payment_intent: 'pi_integration' } } });

run('gateway payments against the database', () => {
  const db = createClient(url ?? 'http://x', service ?? 'x', { auth: { persistSession: false } });
  const refunds: unknown[] = [];
  const fakeStripe = {
    checkout: { sessions: { create: async () => ({ id: `cs_test_${stamp}`, url: `https://checkout.stripe.test/${stamp}` }), retrieve: async () => ({ payment_intent: 'pi_integration' }) } },
    refunds: { create: async (p: unknown) => (refunds.push(p), { id: `re_test_${stamp}` }) },
    webhooks: stripe.webhooks,
  } as unknown as Stripe;
  const gateway = new StripeGateway(fakeStripe, SECRET, 'sk_test_integration');
  const registry = registryOf([gateway]);
  const users: string[] = [];
  let op: { billing: ReturnType<typeof createBilling>; commerce: ReturnType<typeof createCommerce> };
  let sa: { billing: ReturnType<typeof createBilling> };
  let customerId = '';
  let orderId = '';
  let invoiceId = '';
  const session = `cs_test_${stamp}`;

  async function staff(label: string, role: 'operator' | 'super_admin') {
    const email = `${label}-${stamp}@dev.test`;
    const { data, error } = await db.auth.admin.createUser({ email, password: `test-${stamp}-password`, email_confirm: true });
    if (error) throw error;
    users.push(data.user.id);
    await db.from('profiles').insert({ user_id: data.user.id, full_name: `Staff ${label}`, role });
    const client = createClient(url ?? '', anon ?? '', { auth: { persistSession: false } });
    const { error: signIn } = await client.auth.signInWithPassword({ email, password: `test-${stamp}-password` });
    if (signIn) throw signIn;
    return { billing: createBilling(new SupabaseBillingRepository(client), { gateways: registry, siteUrl: 'https://teddypups.test' }), commerce: createCommerce(new SupabaseCommerceRepository(client)) };
  }

  beforeAll(async () => {
    op = await staff('gop', 'operator');
    sa = await staff('gsa', 'super_admin');
    customerId = (await db.from('customers').insert({ full_name: `Gateway Customer ${stamp}`, phone_e164: '+971500000606' }).select('id').single()).data?.id as string;
    const created = await op.commerce.createOrder({ customerId, type: 'local', items: [{ description: 'Puppy', quantity: 1, unitMinor: '1000' }] });
    if (!created.ok) throw new Error('order failed');
    orderId = created.value.id;
    await op.commerce.transitionOrder(orderId, 'confirmed', '');
    const invoice = await op.billing.createInvoice(orderId, '', '');
    if (!invoice.ok) throw new Error('invoice failed');
    invoiceId = invoice.value;
    await op.billing.issueInvoice(invoiceId, '');
  });

  afterAll(async () => {
    const payments = (await db.from('payments').select('id').eq('order_id', orderId)).data?.map((p) => p.id) ?? [];
    await db.from('refunds').delete().in('payment_id', payments);
    await db.from('payments').delete().eq('order_id', orderId);
    await db.from('invoice_lines').delete().eq('invoice_id', invoiceId);
    await db.from('invoices').delete().eq('order_id', orderId);
    await db.from('orders').delete().eq('id', orderId);
    await db.from('customers').delete().eq('id', customerId);
    await db.from('webhook_events').delete().like('event_id', `evt_${stamp}%`);
    for (const id of users) {
      await db.from('notifications').delete().eq('user_id', id);
      await db.from('profiles').delete().eq('user_id', id);
      await db.auth.admin.deleteUser(id);
    }
  });

  const deps = () => ({ registry, ledger: new SupabaseGatewayLedger(db) });

  it('a payment link creates a pending payment for the invoice balance and nothing counts as paid yet', async () => {
    const link = await op.billing.createPaymentLink(invoiceId, 'stripe');
    expect(link).toEqual({ ok: true, value: { url: `https://checkout.stripe.test/${stamp}` } });
    const row = await db.from('payments').select('status, amount_minor, gateway, gateway_ref').eq('order_id', orderId).single();
    expect(row.data).toMatchObject({ status: 'pending', amount_minor: 105000, gateway: 'stripe', gateway_ref: session });
    expect((await db.from('orders').select('paid_minor').eq('id', orderId).single()).data?.paid_minor).toBe(0);
    expect(await op.billing.createPaymentLink(invoiceId, 'stripe')).toMatchObject({ ok: false, error: { message: 'There is already an open payment link for the full balance.' } });
  });

  it('a forged webhook is rejected, a signed one settles once, and a replay changes nothing', async () => {
    const body = completed(`evt_${stamp}_1`, session, 105000);
    expect(await handleGatewayWebhook(deps(), 'stripe', body, 't=1,v1=forged')).toEqual({ status: 400, outcome: 'invalid signature' });
    expect((await db.from('payments').select('status').eq('gateway_ref', session).single()).data?.status).toBe('pending');

    expect(await handleGatewayWebhook(deps(), 'stripe', body, sign(body))).toEqual({ status: 200, outcome: 'settled' });
    expect(await handleGatewayWebhook(deps(), 'stripe', body, sign(body))).toEqual({ status: 200, outcome: 'duplicate_event' });
    const other = completed(`evt_${stamp}_2`, session, 105000);
    expect(await handleGatewayWebhook(deps(), 'stripe', other, sign(other))).toEqual({ status: 200, outcome: 'already_settled' });

    const order = await db.from('orders').select('paid_minor, balance_minor').eq('id', orderId).single();
    expect(order.data).toMatchObject({ paid_minor: 105000, balance_minor: 0 });
    expect((await db.from('invoices').select('status').eq('id', invoiceId).single()).data?.status).toBe('paid');
    expect((await db.from('payments').select('id').eq('order_id', orderId)).data).toHaveLength(1);
    expect((await db.from('outbox').select('id').eq('event', 'payment.succeeded').eq('entity_id', (await db.from('payments').select('id').eq('gateway_ref', session).single()).data?.id)).data).toHaveLength(1);
  });

  it('an operator requests a refund, a super admin approves, Stripe is called once and the ledger follows', async () => {
    const payment = (await db.from('payments').select('id').eq('gateway_ref', session).single()).data?.id as string;
    const request = await op.billing.requestRefund({ paymentId: payment, amountMinor: '300', reason: 'Item returned' });
    if (!request.ok) throw new Error('request failed');
    expect(await sa.billing.decideRefund(request.value, true, 'agreed')).toEqual({ ok: true, value: 'processed' });
    expect(refunds).toEqual([expect.objectContaining({ payment_intent: 'pi_integration', amount: 30000 })]);
    expect((await db.from('orders').select('paid_minor').eq('id', orderId).single()).data?.paid_minor).toBe(75000);
    expect((await db.from('payments').select('status').eq('id', payment).single()).data?.status).toBe('partially_refunded');
    expect((await db.from('refunds').select('status, gateway_ref').eq('id', request.value).single()).data).toMatchObject({ status: 'processed', gateway_ref: `re_test_${stamp}` });
  });

  it('a mismatched amount is not applied and a failed payment is marked failed', async () => {
    await db.from('payments').insert({ order_id: orderId, gateway: 'stripe', gateway_ref: `cs_test_${stamp}_m`, method: 'link', amount_minor: 10000, status: 'pending' });
    const wrong = completed(`evt_${stamp}_3`, `cs_test_${stamp}_m`, 5);
    expect(await handleGatewayWebhook(deps(), 'stripe', wrong, sign(wrong))).toEqual({ status: 200, outcome: 'amount_mismatch' });
    expect((await db.from('payments').select('status').eq('gateway_ref', `cs_test_${stamp}_m`).single()).data?.status).toBe('pending');
    const expired = JSON.stringify({ id: `evt_${stamp}_4`, object: 'event', type: 'checkout.session.expired', created: Math.floor(Date.now() / 1000), api_version: '2026-01-01', data: { object: { id: `cs_test_${stamp}_m`, object: 'checkout.session' } } });
    expect(await handleGatewayWebhook(deps(), 'stripe', expired, sign(expired))).toEqual({ status: 200, outcome: 'failed' });
    expect((await db.from('payments').select('status').eq('gateway_ref', `cs_test_${stamp}_m`).single()).data?.status).toBe('failed');
  });
});
