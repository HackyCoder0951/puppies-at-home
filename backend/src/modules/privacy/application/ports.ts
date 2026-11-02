import type { IncidentRow, RequestRow, SubjectInfo } from '../domain';

export class RepositoryError extends Error {
  constructor(readonly kind: 'forbidden' | 'rule' | 'unavailable', message: string) {
    super(message);
  }
}

export interface IncidentInput { detectedAt: string; awareAt: string; summary: string; dataCategories: string[]; peopleAffected: number | null; riskLevel: string }

export interface PrivacyRepository {
  requests(): Promise<readonly RequestRow[]>;
  createRequest(input: { type: string; requester: string; contact: string; details: string; customerId: string | null }): Promise<string>;
  updateRequest(id: string, status: string, exceptions: string | null, identityVerified: boolean | null): Promise<void>;
  subject(customerId: string): Promise<SubjectInfo | null>;
  exportSubject(customerId: string, requestId: string | null): Promise<unknown>;
  anonymiseSubject(customerId: string, requestId: string | null): Promise<Record<string, number>>;
  restrict(customerId: string, restricted: boolean): Promise<void>;
  withdrawConsent(customerId: string, purpose: string): Promise<number>;
  incidents(): Promise<readonly IncidentRow[]>;
  createIncident(input: IncidentInput): Promise<void>;
  updateIncident(id: string, patch: { status?: string; riskLevel?: string; authorityNotifiedAt?: string | null; individualsNotifiedAt?: string | null; decisionReason?: string | null }): Promise<void>;
}
