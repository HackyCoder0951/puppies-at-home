import { err, ok, type Result } from '@backend/kernel';
import { z } from 'zod';
import { CONSENT_PURPOSES, REQUEST_STATUSES, REQUEST_TYPES, type IncidentRow, type RequestRow, type SubjectInfo } from '../domain';
import { RepositoryError, type PrivacyRepository } from './ports';

export type PrivacyError = { code: 'invalid'; field?: string } | { code: 'forbidden' } | { code: 'rule'; message: string } | { code: 'unavailable' };

const requestSchema = z.object({
  type: z.enum(REQUEST_TYPES, 'type'),
  requester: z.string().trim().min(2, 'requester').max(120, 'requester'),
  contact: z.string().trim().min(3, 'contact').max(200, 'contact'),
  details: z.string().trim().max(2000, 'details').optional().transform((v) => v ?? ''),
  customerId: z.string().uuid().nullable().default(null),
});
const incidentSchema = z.object({
  detectedAt: z.string().min(10, 'detectedAt'),
  awareAt: z.string().min(10, 'awareAt'),
  summary: z.string().trim().min(5, 'summary').max(2000, 'summary'),
  dataCategories: z.string().optional().transform((v) => (v ?? '').split(',').map((c) => c.trim()).filter(Boolean)).pipe(z.array(z.string().max(60)).max(15)),
  peopleAffected: z.string().optional().transform((v) => (v ? Number(v) : null)).pipe(z.number().int().min(0).nullable()),
  riskLevel: z.enum(['unknown', 'low', 'medium', 'high'], 'riskLevel'),
});

export function createPrivacy(repo: PrivacyRepository) {
  async function run<T>(action: () => Promise<T>): Promise<Result<T, PrivacyError>> {
    try {
      return ok(await action());
    } catch (error) {
      if (error instanceof RepositoryError) return err(error.kind === 'rule' ? { code: 'rule', message: error.message } : { code: error.kind });
      throw error;
    }
  }
  const bad = (issue: { path: PropertyKey[]; message: string } | undefined): PrivacyError => ({ code: 'invalid', field: String(issue?.path[0] ?? issue?.message ?? '') });

  return {
    requests: (): Promise<Result<readonly RequestRow[], PrivacyError>> => run(() => repo.requests()),
    incidents: (): Promise<Result<readonly IncidentRow[], PrivacyError>> => run(() => repo.incidents()),
    subject: async (customerId: string): Promise<Result<SubjectInfo, PrivacyError>> => {
      const r = await run(() => repo.subject(customerId));
      return !r.ok ? r : r.value ? ok(r.value) : err({ code: 'rule', message: 'That customer does not exist.' });
    },

    async createRequest(raw: unknown): Promise<Result<string, PrivacyError>> {
      const parsed = requestSchema.safeParse(raw);
      if (!parsed.success) return err(bad(parsed.error.issues[0]));
      return run(() => repo.createRequest(parsed.data));
    },
    async updateRequest(id: string, status: string, exceptions: string, identityVerified: boolean | null): Promise<Result<true, PrivacyError>> {
      if (!(REQUEST_STATUSES as readonly string[]).includes(status)) return err({ code: 'invalid', field: 'status' });
      return run(async () => (await repo.updateRequest(id, status, exceptions.trim() || null, identityVerified), true as const));
    },

    exportSubject: (customerId: string, requestId: string | null) => run(() => repo.exportSubject(customerId, requestId)),
    /** The caller confirms by typing the customer's name; the check happens here so every entry point enforces it. */
    async anonymiseSubject(customerId: string, requestId: string | null, typedName: string): Promise<Result<Record<string, number>, PrivacyError>> {
      const subject = await run(() => repo.subject(customerId));
      if (!subject.ok) return subject;
      if (!subject.value) return err({ code: 'rule', message: 'That customer does not exist.' });
      if (typedName.trim().toLowerCase() !== subject.value.fullName.trim().toLowerCase()) return err({ code: 'rule', message: 'Type the customer’s full name exactly to confirm. This cannot be undone.' });
      return run(() => repo.anonymiseSubject(customerId, requestId));
    },
    restrict: (customerId: string, restricted: boolean) => run(async () => (await repo.restrict(customerId, restricted), true as const)),
    async withdrawConsent(customerId: string, purpose: string): Promise<Result<number, PrivacyError>> {
      if (!(CONSENT_PURPOSES as readonly string[]).includes(purpose)) return err({ code: 'invalid', field: 'purpose' });
      return run(() => repo.withdrawConsent(customerId, purpose));
    },

    async createIncident(raw: unknown): Promise<Result<true, PrivacyError>> {
      const parsed = incidentSchema.safeParse(raw);
      if (!parsed.success) return err(bad(parsed.error.issues[0]));
      return run(async () => (await repo.createIncident(parsed.data), true as const));
    },
    updateIncident: (id: string, patch: { status?: string; riskLevel?: string; authorityNotifiedAt?: string | null; individualsNotifiedAt?: string | null; decisionReason?: string | null }) =>
      run(async () => (await repo.updateIncident(id, patch), true as const)),
  };
}

export type Privacy = ReturnType<typeof createPrivacy>;
