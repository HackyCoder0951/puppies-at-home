import { err, ok, type Result } from '@backend/kernel';
import { EXPORT_COLUMNS, isExportKind, toCsv, type DashboardStats, type ExportKind } from '../domain';

export class RepositoryError extends Error {
  constructor(readonly kind: 'forbidden' | 'rule' | 'unavailable', message: string) {
    super(message);
  }
}

export interface ReportingRepository {
  stats(): Promise<DashboardStats>;
  rows(kind: ExportKind, from: string, to: string): Promise<readonly Record<string, unknown>[]>;
  currentUserId(): Promise<string | null>;
}

export interface ExportAudit { record(event: { actorId: string; kind: ExportKind; from: string; to: string; rows: number }): Promise<void> }
export interface ExportLimiter { hit(userId: string): Promise<number> }

export type ReportingError = { code: 'invalid'; field?: string } | { code: 'forbidden' } | { code: 'rule'; message: string } | { code: 'rate-limited'; retryAfterSeconds: number } | { code: 'unavailable' };

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function createReporting(deps: { repo: ReportingRepository; audit: ExportAudit; limiter: ExportLimiter }) {
  async function run<T>(action: () => Promise<T>): Promise<Result<T, ReportingError>> {
    try {
      return ok(await action());
    } catch (error) {
      if (error instanceof RepositoryError) return err(error.kind === 'rule' ? { code: 'rule', message: error.message } : { code: error.kind });
      throw error;
    }
  }

  return {
    stats: (): Promise<Result<DashboardStats, ReportingError>> => run(() => deps.repo.stats()),

    async exportCsv(kind: string, from: string, to: string): Promise<Result<{ filename: string; csv: string; rows: number }, ReportingError>> {
      if (!isExportKind(kind)) return err({ code: 'invalid', field: 'kind' });
      if (!DATE.test(from) || !DATE.test(to)) return err({ code: 'invalid', field: 'range' });
      const userId = await deps.repo.currentUserId();
      if (!userId) return err({ code: 'forbidden' });
      const wait = await deps.limiter.hit(userId);
      if (wait > 0) return err({ code: 'rate-limited', retryAfterSeconds: wait });
      return run(async () => {
        const rows = await deps.repo.rows(kind, from, to);
        const columns = EXPORT_COLUMNS[kind];
        await deps.audit.record({ actorId: userId, kind, from, to, rows: rows.length });
        return { filename: `teddypups-${kind}-${from}-to-${to}.csv`, csv: toCsv(columns.map((c) => c.header), rows.map((r) => columns.map((c) => c.value(r)))), rows: rows.length };
      });
    },
  };
}

export type Reporting = ReturnType<typeof createReporting>;
