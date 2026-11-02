/** Public API of the reporting module. `createStaffReporting` wires the session client, the export limiter and the audit trail. */
import { createSessionClient, limit, recordAuditEvent } from '@platform';
import { createReporting, type Reporting } from './application';
import { SupabaseReportingRepository } from './infrastructure';

export { moduleDefinition } from './module.config';
export type { Reporting, ReportingError } from './application';
export type { DashboardStats, ExportKind } from './domain';
export { EXPORT_KINDS, isExportKind, formatMinor } from './domain';
export { reportingMessage } from './presentation';

export async function createStaffReporting(): Promise<Reporting> {
  return createReporting({
    repo: new SupabaseReportingRepository(await createSessionClient()),
    limiter: { hit: async (userId) => (await limit('RL-ADM-3', userId)).retryAfterSeconds },
    audit: { record: (e) => recordAuditEvent({ actorId: e.actorId, action: 'export.created', entity: 'export', entityId: e.kind, meta: { kind: e.kind, from: e.from, to: e.to, rows: e.rows } }) },
  });
}
