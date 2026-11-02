import { NextResponse, type NextRequest } from 'next/server';
import { createSessionClient } from '@platform';
import { adminPaths, safeAdminNext } from '@nav';

/** Exchanges the emailed one-time code or token (password reset, invitation) for a session, then continues to a safe admin path. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = safeAdminNext(request.nextUrl.searchParams.get('next'));
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');
  const client = await createSessionClient();
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  } else if (tokenHash && (type === 'invite' || type === 'recovery' || type === 'email')) {
    const { error } = await client.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }
  return NextResponse.redirect(new URL(adminPaths.login(), request.url));
}
