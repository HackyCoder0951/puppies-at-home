import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabasePublicConfig } from './config';

/**
 * Anonymous, cookie-free client for public reads of published views (`v_public_*`) and the public enquiry RPC.
 * It never carries a user session, so RLS treats every call as the `anon` role.
 */
export function createPublicClient(): SupabaseClient {
  const { url, anonKey } = supabasePublicConfig();
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
