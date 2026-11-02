import Stripe from 'stripe';
import { WebhookSignatureError, type CheckoutInput, type GatewayEvent, type PaymentGateway } from '../../application';

/**
 * Stripe hosted Checkout. Card details never touch the application; only the signed webhook changes payment state.
 * The Stripe client is injectable so tests run without a network or real keys.
 */
export class StripeGateway implements PaymentGateway {
  readonly id = 'stripe';
  readonly displayName = 'Stripe';
  readonly mode: 'test' | 'live';

  constructor(private readonly client: Stripe, private readonly webhookSecret: string, secretKey: string) {
    this.mode = secretKey.includes('_test_') ? 'test' : 'live';
  }

  async createCheckout(input: CheckoutInput) {
    const session = await this.client.checkout.sessions.create(
      {
        mode: 'payment',
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        client_reference_id: input.orderId,
        line_items: [{ quantity: 1, price_data: { currency: input.currency.toLowerCase(), unit_amount: input.amountMinor, product_data: { name: input.invoiceNumber ? `Invoice ${input.invoiceNumber} (order ${input.orderNumber})` : `Order ${input.orderNumber}` } } }],
        metadata: { orderId: input.orderId, ...(input.invoiceId ? { invoiceId: input.invoiceId } : {}) },
        payment_intent_data: { metadata: { orderId: input.orderId, ...(input.invoiceId ? { invoiceId: input.invoiceId } : {}) } },
      },
      { idempotencyKey: input.idempotencyKey },
    );
    if (!session.url) throw new Error('Stripe returned no checkout URL');
    return { url: session.url, gatewayRef: session.id };
  }

  async verifyWebhook(rawBody: string, signature: string | null): Promise<GatewayEvent | null> {
    if (!signature) throw new WebhookSignatureError('missing signature');
    let event: Stripe.Event;
    try {
      event = await this.client.webhooks.constructEventAsync(rawBody, signature, this.webhookSecret);
    } catch (error) {
      throw new WebhookSignatureError(String(error));
    }
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const s = event.data.object;
        if (s.payment_status !== 'paid') return null;   // a delayed method is still pending: wait for the async event
        return { type: 'payment.succeeded', eventId: event.id, gatewayRef: s.id, amountMinor: s.amount_total ?? 0, currency: (s.currency ?? '').toUpperCase(), paidAt: new Date(event.created * 1000), raw: { sessionId: s.id, paymentIntent: s.payment_intent } };
      }
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed':
        return { type: 'payment.failed', eventId: event.id, gatewayRef: event.data.object.id, reason: event.type === 'checkout.session.expired' ? 'checkout expired' : 'payment failed' };
      default:
        return null;
    }
  }

  async refund(input: { gatewayRef: string; amountMinor: number; reason: string; idempotencyKey: string }) {
    const session = await this.client.checkout.sessions.retrieve(input.gatewayRef);
    const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    if (!paymentIntent) throw new Error('The checkout session has no payment to refund');
    const refund = await this.client.refunds.create({ payment_intent: paymentIntent, amount: input.amountMinor, reason: 'requested_by_customer', metadata: { note: input.reason.slice(0, 200) } }, { idempotencyKey: input.idempotencyKey });
    return { gatewayRef: refund.id };
  }
}

/** Builds the SDK client with sensible network limits. */
export const createStripeClient = (secretKey: string): Stripe => new Stripe(secretKey, { maxNetworkRetries: 2, timeout: 15_000 });
