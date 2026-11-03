import type { SupabaseClient } from '@supabase/supabase-js';
import type { GatewayEvent, GatewayLedger } from '../../application';

/** Webhook-side ledger writes with the service-role client handed in by the webhook route. */
export class SupabaseGatewayLedger implements GatewayLedger {
  constructor(private readonly db: SupabaseClient) {}

  async settle(gateway: string, event: Extract<GatewayEvent, { type: 'payment.succeeded' }>) {
    const { data, error } = await this.db.rpc('settle_gateway_payment', {
      p_gateway: gateway, p_ref: event.gatewayRef, p_event_id: event.eventId, p_amount_minor: event.amountMinor, p_currency: event.currency, p_paid_at: event.paidAt.toISOString(), p_raw: event.raw,
    });
    if (error) throw new Error(`settle: ${error.message}`);
    return String(data);
  }

  async fail(gateway: string, event: Extract<GatewayEvent, { type: 'payment.failed' }>) {
    const { data, error } = await this.db.rpc('fail_gateway_payment', { p_gateway: gateway, p_ref: event.gatewayRef, p_event_id: event.eventId, p_reason: event.reason });
    if (error) throw new Error(`fail: ${error.message}`);
    return String(data);
  }

  async recordRefund(gateway: string, event: Extract<GatewayEvent, { type: 'refund.recorded' }>) {
    const { data, error } = await this.db.rpc('record_gateway_refund', { p_gateway: gateway, p_payment_intent: event.paymentIntent, p_event_id: event.eventId, p_total_refunded_minor: event.totalRefundedMinor, p_currency: event.currency });
    if (error) throw new Error(`refund: ${error.message}`);
    return String(data);
  }
}
