import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireServiceRoleKey } from '@backend/config';
import { supabasePublicConfig } from './config';

/**
 * Service-role client: bypasses RLS. Allowed only in cron and webhook handlers, the outbox worker and the bootstrap
 * script (enforced by an architecture test). Never import from components, pages or server actions.
 */
export function createServiceClient(): SupabaseClient {
  const { url } = supabasePublicConfig();
  return createClient(url, requireServiceRoleKey(), { auth: { persistSession: false, autoRefreshToken: false } });
}
