import { NextResponse, type NextRequest } from 'next/server';
import { answerWhatsAppHandshake, processWhatsAppWebhook } from '@backend/modules/messaging';
import { clientIp, limit } from '@platform';
import { createServiceClient } from '@platform/supabase/service';

export const dynamic = 'force-dynamic';

/** Meta's subscription handshake: echoes the challenge only when the verify token matches. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const challenge = answerWhatsAppHandshake({ mode: q.get('hub.mode'), token: q.get('hub.verify_token'), challenge: q.get('hub.challenge') });
  return challenge === null ? new NextResponse('Forbidden', { status: 403 }) : new NextResponse(challenge, { headers: { 'Content-Type': 'text/plain' } });
}

/** Receipts and customer replies: the raw body is verified against the app secret before anything is read from it. */
export async function POST(request: NextRequest) {
  if (!(await limit('RL-WH-1', clientIp(request.headers))).allowed) return NextResponse.json({ error: 'rate limited' }, { status: 429 });
  const body = await request.text();
  const result = await processWhatsAppWebhook(createServiceClient(), body, request.headers.get('x-hub-signature-256'));
  return NextResponse.json({ outcome: result.outcome }, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
}
