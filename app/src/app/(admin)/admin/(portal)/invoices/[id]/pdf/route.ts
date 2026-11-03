import { NextResponse, type NextRequest } from 'next/server';
import { invoicePdfFor } from '@backend/modules/billing';
import { createSessionClient } from '@platform';

export const dynamic = 'force-dynamic';

/** Downloads an issued invoice as a PDF. The staff session decides what is visible: the database refuses invoices the signed-in person may not read. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse('Not found', { status: 404 });
  const pdf = await invoicePdfFor(await createSessionClient(), id);
  if (!pdf) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(Buffer.from(pdf.bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${pdf.filename}"`, 'Cache-Control': 'private, no-store' } });
}
