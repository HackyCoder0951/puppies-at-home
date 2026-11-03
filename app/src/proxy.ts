import { NextResponse, type NextRequest } from 'next/server';
import { adminCsp, evaluateSession, newNonce, originOf, parseStamp, refreshSession, SEEN_COOKIE, START_COOKIE } from '@platform';
import { getEnv } from '@shared/config';

/** Admin gate (Next 16 `proxy`): nothing under /admin is reachable without a verified session (AC-012). */
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/forgot-password', '/admin/auth/callback'];

function harden(response: NextResponse, csp?: string): NextResponse {
  if (csp) response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function proxy(request: NextRequest) {
  if (getEnv().DATA_SOURCE !== 'supabase') return harden(NextResponse.rewrite(new URL('/admin-disabled', request.url), { status: 404 }));
  // Per-request nonce: Next reads it from the request's CSP header and stamps its own scripts with it.
  const nonce = newNonce();
  const csp = adminCsp(nonce, { supabaseOrigin: originOf(getEnv().NEXT_PUBLIC_SUPABASE_URL), dev: getEnv().NODE_ENV === 'development' });
  request.headers.set('x-nonce', nonce);
  request.headers.set('Content-Security-Policy', csp);
  const { response, signedIn } = await refreshSession(request);
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const env = getEnv();
  const now = Date.now();
  if (signedIn) {
    const verdict = evaluateSession({ seen: parseStamp(request.cookies.get(SEEN_COOKIE)?.value), start: parseStamp(request.cookies.get(START_COOKIE)?.value), now, idleMinutes: env.SESSION_IDLE_MINUTES, absoluteHours: env.SESSION_ABSOLUTE_HOURS });
    if (verdict !== 'ok') {
      // Expired: drop every auth cookie so the next request is signed out, then ask for a fresh sign-in.
      const out = NextResponse.redirect(new URL(`/admin/login?reason=${verdict === 'idle' ? 'idle' : 'expired'}`, request.url));
      for (const c of request.cookies.getAll()) if (c.name.startsWith('sb-') || c.name === SEEN_COOKIE || c.name === START_COOKIE) out.cookies.delete(c.name);
      return harden(out);
    }
    const cookie = { httpOnly: true, sameSite: 'lax' as const, secure: env.APP_ENV !== 'local', path: '/admin' };
    response.cookies.set(SEEN_COOKIE, String(now), cookie);
    if (!request.cookies.get(START_COOKIE)) response.cookies.set(START_COOKIE, String(now), cookie);
  } else if (request.cookies.get(SEEN_COOKIE) || request.cookies.get(START_COOKIE)) {
    response.cookies.delete(SEEN_COOKIE);
    response.cookies.delete(START_COOKIE);
  }
  if (!signedIn && !isPublic) {
    const login = new URL('/admin/login', request.url);
    if (pathname !== '/admin') login.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
    return harden(NextResponse.redirect(login));
  }
  if (signedIn && pathname === '/admin/login') return harden(NextResponse.redirect(new URL('/admin', request.url)));
  return harden(response, csp);
}

export const config = { matcher: ['/admin/:path*'] };
