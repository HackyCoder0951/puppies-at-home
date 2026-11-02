import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabasePublicConfig } from './config';

/** Per-request client bound to the signed-in staff session (cookies). Used by the admin and its server actions. */
export async function createSessionClient(): Promise<SupabaseClient> {
  const { url, anonKey } = supabasePublicConfig();
  const store = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a server component: the proxy refreshes the session instead.
        }
      },
    },
  });
}
