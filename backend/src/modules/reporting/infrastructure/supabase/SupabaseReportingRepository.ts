import type { SupabaseClient } from '@supabase/supabase-js';
import type { DashboardStats, ExportKind } from '../../domain';
import { RepositoryError, type ReportingRepository } from '../../application';

type Failure = { code?: string; message: string } | null;

function fail(error: Failure): never {
  if (error?.code === '42501') throw new RepositoryError('forbidden', error.message);
  if (error?.code === 'P0001' || error?.code === '22023') throw new RepositoryError('rule', error.message);
  throw new RepositoryError('unavailable', error?.message ?? 'unknown');
}

export class SupabaseReportingRepository implements ReportingRepository {
  constructor(private readonly client: SupabaseClient) {}

  async stats() {
    const { data, error } = await this.client.rpc('admin_dashboard_stats');
    if (error) fail(error);
    return data as DashboardStats;
  }

  async rows(kind: ExportKind, from: string, to: string) {
    const { data, error } = await this.client.rpc('export_rows', { p_kind: kind, p_from: from, p_to: to });
    if (error) fail(error);
    return (data ?? []) as Record<string, unknown>[];
  }

  async currentUserId() {
    const { data } = await this.client.auth.getUser();
    return data.user?.id ?? null;
  }
}
