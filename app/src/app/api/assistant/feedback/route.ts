import { NextResponse, type NextRequest } from 'next/server';
import { recordAssistantFeedback } from '@composition';
import { clientIp } from '@platform';

export const dynamic = 'force-dynamic';

/** A rating or a click from the chat widget (text-free). 503 while the assistant is switched off. */
export async function POST(request: NextRequest) {
  const outcome = await recordAssistantFeedback(await request.json().catch(() => null), clientIp(request.headers));
  const status = outcome === 'recorded' ? 204 : outcome === 'rate-limited' ? 429 : outcome === 'invalid' ? 400 : 503;
  return new NextResponse(null, { status, headers: { 'Cache-Control': 'no-store' } });
}
