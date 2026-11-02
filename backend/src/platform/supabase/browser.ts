'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Browser client (anon key plus the staff session cookie). Used only for Realtime notifications in the admin. */
export function createBrowserSupabase(url: string, anonKey: string): SupabaseClient {
  return createBrowserClient(url, anonKey);
}
