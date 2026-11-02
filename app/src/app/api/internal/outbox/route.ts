import { NextResponse, type NextRequest } from 'next/server';
import { createServiceOutboxWorker } from '@backend/modules/messaging';
import { verifyCronRequest } from '@platform';
import { createServiceClient } from '@platform/supabase/service';

export const dynamic = 'force-dynamic';

/** Outbox worker entry point for Vercel Cron (every minute) and best-effort kicks after important commits. */
export async function GET(request: NextRequest) {
  if (!(await verifyCronRequest(request.headers))) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const summary = await createServiceOutboxWorker(createServiceClient()).run();
  return NextResponse.json(summary, { headers: { 'Cache-Control': 'no-store' } });
}
