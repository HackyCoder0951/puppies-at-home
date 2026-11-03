import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface DailyReport { readonly overdueInvoices: number; readonly retention: unknown; readonly outboxPruned: number; readonly auditPruned: number; readonly staffDigest: string }

/**
 * Daily housekeeping, run by cron with the service role: invoices past their due date, the retention job (old leads,
 * old message text, old login attempts), pruning of finished outbox rows and of audit rows older than seven years, and (when enabled) queuing the staff digest.
 */
export async function runDailyJobs(db: SupabaseClient, options: { staffDigest?: boolean } = {}): Promise<DailyReport> {
  const call = async <T>(name: string, args: Record<string, unknown> = {}): Promise<T> => {
    const { data, error } = await db.rpc(name, args);
    if (error) throw new Error(`${name}: ${error.message}`);
    return data as T;
  };
  return {
    overdueInvoices: await call<number>('mark_overdue_invoices'),
    retention: await call<unknown>('anonymise_old_records'),
    outboxPruned: await call<number>('prune_outbox'),
    auditPruned: await call<number>('prune_audit_log', { p_years: 7 }),
    staffDigest: options.staffDigest ? await call<string>('queue_staff_digest') : 'off',
  };
}
