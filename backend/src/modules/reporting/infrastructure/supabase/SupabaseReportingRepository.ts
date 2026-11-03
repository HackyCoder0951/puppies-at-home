import type { SupabaseClient } from '@supabase/supabase-js';
import type { DashboardStats, ExportKind, TrendSeries } from '../../domain';
import { RepositoryError, type AssistantOverview, type AuditRow, type ReportingRepository } from '../../application';

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

  async trends(days: number) {
    const { data, error } = await this.client.rpc('admin_trend_series', { p_days: days });
    if (error) fail(error);
    return data as TrendSeries;
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

  async audit(page: number, action: string | undefined) {
    let query = this.client.from('audit_log').select('id, created_at, action, entity, entity_id, actor_id, before, after', { count: 'exact' });
    if (action) query = query.ilike('action', `${action}%`);
    const { data, count, error } = await query.order('id', { ascending: false }).range((page - 1) * 50, page * 50 - 1);
    if (error) fail(error);
    const { data: staff } = await this.client.rpc('list_staff');
    const names = new Map(((staff ?? []) as { user_id: string; full_name: string }[]).map((s) => [s.user_id, s.full_name]));
    const keys = (o: unknown) => (o && typeof o === 'object' ? Object.keys(o as Record<string, unknown>) : []);
    return {
      rows: (data ?? []).map((r): AuditRow => {
        const a = (r.after ?? {}) as Record<string, unknown>;
        const b = (r.before ?? {}) as Record<string, unknown>;
        const changed = keys(r.after).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
        return { id: r.id, at: r.created_at, action: r.action, entity: r.entity, entityId: r.entity_id, actor: r.actor_id ? (names.get(r.actor_id) ?? 'Former staff or system') : null, changed, before: r.before, after: r.after };
      }),
      total: count ?? 0,
    };
  }

  async assistant(days: number): Promise<AssistantOverview> {
    const { data, error } = await this.client.rpc('assistant_overview', { p_days: days });
    if (error) fail(error);
    return data as AssistantOverview;
  }
}
