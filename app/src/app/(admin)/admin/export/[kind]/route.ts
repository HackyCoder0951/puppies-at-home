import { NextResponse, type NextRequest } from 'next/server';
import { reportingMessage } from '@backend/modules/reporting';
import { getReporting } from '@composition';

export const dynamic = 'force-dynamic';

/** CSV download. The admin proxy has already required a session; the database checks the export permission. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const q = request.nextUrl.searchParams;
  const result = await (await getReporting()).exportCsv((await params).kind, q.get('from') ?? '', q.get('to') ?? '');
  if (!result.ok) {
    const status = result.error.code === 'forbidden' ? 403 : result.error.code === 'rate-limited' ? 429 : 400;
    return new NextResponse(reportingMessage(result.error), { status, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  return new NextResponse(result.value.csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${result.value.filename}"`, 'Cache-Control': 'no-store' } });
}
