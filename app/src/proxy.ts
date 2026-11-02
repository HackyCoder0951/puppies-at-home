import { NextResponse, type NextRequest } from 'next/server';
import { refreshSession } from '@platform';
import { getEnv } from '@shared/config';

/** Admin gate (Next 16 `proxy`): nothing under /admin is reachable without a verified session (AC-012). */
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/forgot-password', '/admin/auth/callback'];

function harden(response: NextResponse): NextResponse {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function proxy(request: NextRequest) {
  if (getEnv().DATA_SOURCE !== 'supabase') return harden(NextResponse.rewrite(new URL('/admin-disabled', request.url), { status: 404 }));
  const { response, signedIn } = await refreshSession(request);
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!signedIn && !isPublic) {
    const login = new URL('/admin/login', request.url);
    if (pathname !== '/admin') login.searchParams.set('next', pathname);
    return harden(NextResponse.redirect(login));
  }
  if (signedIn && pathname === '/admin/login') return harden(NextResponse.redirect(new URL('/admin', request.url)));
  return harden(response);
}

export const config = { matcher: ['/admin/:path*'] };
