import { NextResponse, type NextRequest } from 'next/server';
import { chatResponse } from '@composition';
import { clientIp } from '@platform';

export const dynamic = 'force-dynamic';

/** One chat turn as a server-sent event stream. Answers 503 while the assistant is switched off. */
export async function POST(request: NextRequest) {
  const input: unknown = await request.json().catch(() => null);
  return chatResponse(input, clientIp(request.headers)) ?? NextResponse.json({ error: 'assistant is resting' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
