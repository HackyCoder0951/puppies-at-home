import Stripe from 'stripe';
import { describe, expect, it } from 'vitest';
import { StripeGateway } from './StripeGateway';
import { handleGatewayWebhook, registryOf, type GatewayEvent, type GatewayLedger, WebhookSignatureError } from '../../application';

const SECRET = 'whsec_test_secret_for_unit_tests_0123456789';
const stripe = new Stripe('sk_test_unit');
const sign = (payload: string) => stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
const event = (type: string, object: Record<string, unknown>, id = 'evt_1') => JSON.stringify({ id, object: 'event', type, created: 1_793_000_000, data: { object }, api_version: '2026-01-01' });

function gateway(client: unknown = stripe) {
  return new StripeGateway(client as Stripe, SECRET, 'sk_test_unit');
}

describe('StripeGateway webhooks', () => {
  it('turns a paid checkout session into a succeeded event with the amount and currency from Stripe', async () => {
    const body = event('checkout.session.completed', { id: 'cs_test_1', object: 'checkout.session', payment_status: 'paid', amount_total: 105000, currency: 'aed', payment_intent: 'pi_1' });
    const parsed = await gateway().verifyWebhook(body, sign(body));
    expect(parsed).toMatchObject({ type: 'payment.succeeded', eventId: 'evt_1', gatewayRef: 'cs_test_1', amountMinor: 105000, currency: 'AED' });
  });

  it('maps charge.refunded to the cumulative refunded amount for the payment', async () => {
    const body = event('charge.refunded', { id: 'ch_1', object: 'charge', payment_intent: 'pi_9', amount_refunded: 20000, currency: 'aed' }, 'evt_9');
    expect(await gateway().verifyWebhook(body, sign(body))).toEqual({ type: 'refund.recorded', eventId: 'evt_9', paymentIntent: 'pi_9', totalRefundedMinor: 20000, currency: 'AED' });
    const noIntent = event('charge.refunded', { id: 'ch_2', object: 'charge', payment_intent: null, amount_refunded: 1, currency: 'aed' }, 'evt_10');
    expect(await gateway().verifyWebhook(noIntent, sign(noIntent))).toBeNull();
  });

  it('waits for the async event when a delayed method is still unpaid, and maps expiry to a failure', async () => {
    const unpaid = event('checkout.session.completed', { id: 'cs_test_2', object: 'checkout.session', payment_status: 'unpaid', amount_total: 100, currency: 'aed' });
    expect(await gateway().verifyWebhook(unpaid, sign(unpaid))).toBeNull();
    const expired = event('checkout.session.expired', { id: 'cs_test_3', object: 'checkout.session' }, 'evt_2');
    expect(await gateway().verifyWebhook(expired, sign(expired))).toMatchObject({ type: 'payment.failed', gatewayRef: 'cs_test_3', reason: 'checkout expired' });
    const other = event('customer.created', { id: 'cus_1', object: 'customer' }, 'evt_3');
    expect(await gateway().verifyWebhook(other, sign(other))).toBeNull();
  });

  it('rejects a missing, forged or tampered signature', async () => {
    const body = event('checkout.session.completed', { id: 'cs_test_4', object: 'checkout.session', payment_status: 'paid', amount_total: 1, currency: 'aed' });
    await expect(gateway().verifyWebhook(body, null)).rejects.toBeInstanceOf(WebhookSignatureError);
    await expect(gateway().verifyWebhook(body, 't=1,v1=deadbeef')).rejects.toBeInstanceOf(WebhookSignatureError);
    const good = sign(body);
    await expect(gateway().verifyWebhook(body.replace('"amount_total":1', '"amount_total":999999'), good)).rejects.toBeInstanceOf(WebhookSignatureError);
  });
});

describe('StripeGateway requests', () => {
  it('creates a hosted checkout with the server-derived amount, metadata and an idempotency key', async () => {
    const calls: { params: Stripe.Checkout.SessionCreateParams; options: Stripe.RequestOptions | undefined }[] = [];
    const client = { checkout: { sessions: { create: async (params: Stripe.Checkout.SessionCreateParams, options?: Stripe.RequestOptions) => (calls.push({ params, options }), { id: 'cs_test_9', url: 'https://checkout.stripe.test/c/cs_test_9' }) } } };
    const out = await gateway(client).createCheckout({ orderNumber: 'TP-1', invoiceNumber: 'INV-1', orderId: 'o1', invoiceId: 'i1', amountMinor: 105000, currency: 'AED', successUrl: 'https://x/ok', cancelUrl: 'https://x/no', idempotencyKey: 'link:i1:0:0' });
    expect(out).toEqual({ url: 'https://checkout.stripe.test/c/cs_test_9', gatewayRef: 'cs_test_9' });
    expect(calls[0]?.params).toMatchObject({ mode: 'payment', client_reference_id: 'o1', metadata: { orderId: 'o1', invoiceId: 'i1' } });
    expect(calls[0]?.params.line_items?.[0]?.price_data).toMatchObject({ currency: 'aed', unit_amount: 105000 });
    expect(calls[0]?.options).toEqual({ idempotencyKey: 'link:i1:0:0' });
  });

  it('refunds the payment behind the checkout session once per idempotency key', async () => {
    const refunds: Stripe.RefundCreateParams[] = [];
    const client = { checkout: { sessions: { retrieve: async () => ({ payment_intent: 'pi_77' }) } }, refunds: { create: async (p: Stripe.RefundCreateParams) => (refunds.push(p), { id: 're_1' }) } };
    expect(await gateway(client).refund({ gatewayRef: 'cs_test_9', amountMinor: 30000, reason: 'returned', idempotencyKey: 'refund:r1' })).toEqual({ gatewayRef: 're_1' });
    expect(refunds[0]).toMatchObject({ payment_intent: 'pi_77', amount: 30000 });
  });
});

describe('webhook handler', () => {
  const ledger = (log: string[]): GatewayLedger => ({ settle: async (g, e: Extract<GatewayEvent, { type: 'payment.succeeded' }>) => (log.push(`settle ${g} ${e.gatewayRef}`), 'settled'), fail: async (g, e) => (log.push(`fail ${g} ${e.gatewayRef}`), 'failed'), recordRefund: async (g, e) => (log.push(`refund ${g} ${e.paymentIntent}`), 'refund_recorded') });

  it('acknowledges ignored events, applies verified ones and answers 400 for bad signatures', async () => {
    const log: string[] = [];
    const deps = { registry: registryOf([gateway()]), ledger: ledger(log) };
    const paid = event('checkout.session.completed', { id: 'cs_test_5', object: 'checkout.session', payment_status: 'paid', amount_total: 500, currency: 'aed' });
    expect(await handleGatewayWebhook(deps, 'stripe', paid, sign(paid))).toEqual({ status: 200, outcome: 'settled' });
    const other = event('customer.created', { id: 'cus_2', object: 'customer' }, 'evt_9');
    expect(await handleGatewayWebhook(deps, 'stripe', other, sign(other))).toEqual({ status: 200, outcome: 'ignored' });
    expect(await handleGatewayWebhook(deps, 'stripe', paid, 't=1,v1=00')).toEqual({ status: 400, outcome: 'invalid signature' });
    expect(await handleGatewayWebhook({ registry: registryOf([]), ledger: ledger(log) }, 'stripe', paid, sign(paid))).toEqual({ status: 404, outcome: 'gateway not enabled' });
    const refunded = event('charge.refunded', { id: 'ch_3', object: 'charge', payment_intent: 'pi_5', amount_refunded: 100, currency: 'aed' }, 'evt_11');
    expect(await handleGatewayWebhook(deps, 'stripe', refunded, sign(refunded))).toEqual({ status: 200, outcome: 'refund_recorded' });
    expect(log).toEqual(['settle stripe cs_test_5', 'refund stripe pi_5']);
  });
});
