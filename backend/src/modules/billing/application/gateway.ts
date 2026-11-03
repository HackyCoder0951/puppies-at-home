/** Gateway adapter interface (docs/02-architecture/10 section 2). The core never imports a gateway SDK. */
export interface CheckoutInput {
  readonly orderNumber: string;
  readonly invoiceNumber: string | null;
  readonly orderId: string;
  readonly invoiceId: string | null;
  readonly amountMinor: number;
  readonly currency: string;
  readonly successUrl: string;
  readonly cancelUrl: string;
  readonly idempotencyKey: string;
}

export type GatewayEvent =
  | { readonly type: 'payment.succeeded'; readonly eventId: string; readonly gatewayRef: string; readonly amountMinor: number; readonly currency: string; readonly paidAt: Date; readonly raw: unknown }
  | { readonly type: 'payment.failed'; readonly eventId: string; readonly gatewayRef: string; readonly reason: string }
  | { readonly type: 'refund.recorded'; readonly eventId: string; readonly paymentIntent: string; readonly totalRefundedMinor: number; readonly currency: string };

export interface PaymentGateway {
  readonly id: string;
  readonly displayName: string;
  readonly mode: 'test' | 'live';
  createCheckout(input: CheckoutInput): Promise<{ url: string; gatewayRef: string }>;
  /** Verifies the signature on the raw body; returns null for events we do not act on, throws on a bad signature. */
  verifyWebhook(rawBody: string, signature: string | null): Promise<GatewayEvent | null>;
  refund(input: { gatewayRef: string; amountMinor: number; reason: string; idempotencyKey: string }): Promise<{ gatewayRef: string }>;
}

export interface GatewayRegistry {
  get(id: string): PaymentGateway | undefined;
  list(): readonly PaymentGateway[];
}

export class WebhookSignatureError extends Error {}

/** Service-role ledger writes used by the webhook handler. */
export interface GatewayLedger {
  settle(gateway: string, event: Extract<GatewayEvent, { type: 'payment.succeeded' }>): Promise<string>;
  fail(gateway: string, event: Extract<GatewayEvent, { type: 'payment.failed' }>): Promise<string>;
  recordRefund(gateway: string, event: Extract<GatewayEvent, { type: 'refund.recorded' }>): Promise<string>;
}

export const emptyRegistry: GatewayRegistry = { get: () => undefined, list: () => [] };
export const registryOf = (gateways: readonly PaymentGateway[]): GatewayRegistry => ({ get: (id) => gateways.find((g) => g.id === id), list: () => gateways });

/** Verifies and applies one webhook delivery. Replays and unknown references are acknowledged, bad signatures are not. */
export async function handleGatewayWebhook(deps: { registry: GatewayRegistry; ledger: GatewayLedger }, gatewayId: string, rawBody: string, signature: string | null): Promise<{ status: number; outcome: string }> {
  const gateway = deps.registry.get(gatewayId);
  if (!gateway) return { status: 404, outcome: 'gateway not enabled' };
  let event: GatewayEvent | null;
  try {
    event = await gateway.verifyWebhook(rawBody, signature);
  } catch {
    return { status: 400, outcome: 'invalid signature' };
  }
  if (!event) return { status: 200, outcome: 'ignored' };
  const outcome = event.type === 'payment.succeeded' ? await deps.ledger.settle(gatewayId, event) : event.type === 'refund.recorded' ? await deps.ledger.recordRefund(gatewayId, event) : await deps.ledger.fail(gatewayId, event);
  return { status: 200, outcome };
}
