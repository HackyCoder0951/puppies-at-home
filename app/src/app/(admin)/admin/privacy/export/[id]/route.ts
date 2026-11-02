import { NextResponse, type NextRequest } from 'next/server';
import { privacyMessage } from '@backend/modules/privacy';
import { getPrivacy } from '@composition';

export const dynamic = 'force-dynamic';

/** Subject export as a JSON download. The database checks `privacy.export` and writes the audit row. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await (await getPrivacy()).exportSubject(id, request.nextUrl.searchParams.get('request'));
  if (!result.ok) return new NextResponse(privacyMessage(result.error), { status: result.error.code === 'forbidden' ? 403 : 400, headers: { 'Cache-Control': 'no-store' } });
  return new NextResponse(JSON.stringify(result.value, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="subject-export-${id}.json"`, 'Cache-Control': 'no-store' } });
}
