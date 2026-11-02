import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabasePublicConfig } from './config';

/**
 * Refreshes the staff session cookies for a request and reports whether a user is signed in. Used by the admin gate
 * in `proxy.ts`. The check validates the token with the auth server (getUser), never just the cookie contents.
 */
export async function refreshSession(request: NextRequest): Promise<{ response: NextResponse; signedIn: boolean }> {
  const { url, anonKey } = supabasePublicConfig();
  let response = NextResponse.next({ request });
  const client = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await client.auth.getUser();
  return { response, signedIn: Boolean(data.user) };
}
