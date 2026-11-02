import { NextResponse, type NextRequest } from 'next/server';
import { processGatewayWebhook } from '@backend/modules/billing';
import { clientIp, limit } from '@platform';
import { createServiceClient } from '@platform/supabase/service';

export const dynamic = 'force-dynamic';

/** Stripe webhook: the raw body is verified against `STRIPE_WEBHOOK_SECRET`; only a verified event touches the ledger. */
export async function POST(request: NextRequest) {
  if (!(await limit('RL-WH-1', clientIp(request.headers))).allowed) return NextResponse.json({ error: 'rate limited' }, { status: 429 });
  const body = await request.text();
  const result = await processGatewayWebhook(createServiceClient(), 'stripe', body, request.headers.get('stripe-signature'));
  return NextResponse.json({ outcome: result.outcome }, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
}
