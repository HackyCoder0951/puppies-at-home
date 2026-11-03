import { NextResponse, type NextRequest } from 'next/server';
import { getEnv } from '@shared/config';
import { runDailyJobs, verifyCronRequest } from '@platform';
import { createServiceClient } from '@platform/supabase/service';

export const dynamic = 'force-dynamic';

/** Daily housekeeping for Vercel Cron: overdue invoices, retention, pruning and the staff digest (when enabled). */
export async function GET(request: NextRequest) {
  const headers = { 'Cache-Control': 'no-store' };
  if (!(await verifyCronRequest(request.headers))) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers });
  return NextResponse.json(await runDailyJobs(createServiceClient(), { staffDigest: getEnv().FEATURE_STAFF_DIGEST }), { headers });
}
