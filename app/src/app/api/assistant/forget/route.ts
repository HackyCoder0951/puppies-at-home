import { NextResponse, type NextRequest } from 'next/server';
import { forgetAssistantConversation } from '@composition';
import { clientIp } from '@platform';

export const dynamic = 'force-dynamic';

/** The visitor deletes their chat: 204 when removed (or already gone), 503 while the assistant is switched off. */
export async function POST(request: NextRequest) {
  const outcome = await forgetAssistantConversation(await request.json().catch(() => null), clientIp(request.headers));
  return new NextResponse(null, { status: outcome === null ? 503 : 204, headers: { 'Cache-Control': 'no-store' } });
}
