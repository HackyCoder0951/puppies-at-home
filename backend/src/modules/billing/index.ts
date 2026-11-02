/** Public API of the billing module. `createStaffBilling` wires the Supabase adapter for one signed-in request. */
import { getEnv } from '@backend/config';
import { createSessionClient, type SupabaseClient } from '@platform';
import { createBilling, handleGatewayWebhook, registryOf, type Billing, type GatewayRegistry, type PaymentGateway } from './application';
import { StripeGateway, SupabaseBillingRepository, SupabaseGatewayLedger, createStripeClient } from './infrastructure';

export { moduleDefinition } from './module.config';
export type { Billing, BillingError } from './application';
export type { InvoiceRow, InvoiceDetail, InvoiceLineRow, PaymentRow, RefundRow, OrderMoney, TaxRate, InvoiceStatus, PaymentMethod } from './domain';
export { INVOICE_STATUSES, PAYMENT_METHODS, PAGE_SIZE, formatMoney, formatRate } from './domain';
export { billingMessage, INVOICE_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, REFUND_STATUS_LABEL } from './presentation';

/** Gateways named in `PAYMENT_GATEWAYS` that have their secrets; others are simply not registered. */
export function enabledGateways(): GatewayRegistry {
  const env = getEnv();
  const list: PaymentGateway[] = [];
  if (env.PAYMENT_GATEWAYS.includes('stripe') && env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET) {
    list.push(new StripeGateway(createStripeClient(env.STRIPE_SECRET_KEY), env.STRIPE_WEBHOOK_SECRET, env.STRIPE_SECRET_KEY));
  }
  return registryOf(list);
}

export async function createStaffBilling(): Promise<Billing> {
  return createBilling(new SupabaseBillingRepository(await createSessionClient()), { gateways: enabledGateways(), siteUrl: getEnv().NEXT_PUBLIC_SITE_URL });
}

/** Webhook entry point: the route passes the raw body, the signature header and a service-role client. */
export function processGatewayWebhook(db: SupabaseClient, gatewayId: string, rawBody: string, signature: string | null) {
  return handleGatewayWebhook({ registry: enabledGateways(), ledger: new SupabaseGatewayLedger(db) }, gatewayId, rawBody, signature);
}
