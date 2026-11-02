import { NextResponse, type NextRequest } from 'next/server';
import { createSessionClient } from '@platform';
import { adminPaths, safeAdminNext } from '@nav';

/** Exchanges the emailed one-time code (password reset) for a session, then continues to a safe admin path. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = safeAdminNext(request.nextUrl.searchParams.get('next'));
  if (code) {
    const { error } = await (await createSessionClient()).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }
  return NextResponse.redirect(new URL(adminPaths.login(), request.url));
}
