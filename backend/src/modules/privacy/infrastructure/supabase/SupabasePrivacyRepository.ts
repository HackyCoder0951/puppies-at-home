import type { SupabaseClient } from '@supabase/supabase-js';
import type { IncidentRow, RequestRow, SubjectInfo } from '../../domain';
import { RepositoryError, type IncidentInput, type PrivacyRepository } from '../../application';

type Failure = { code?: string; message: string } | null;

function fail(error: Failure): never {
  const message = error?.message ?? 'unknown';
  if (error?.code === '42501') throw new RepositoryError('forbidden', message);
  if (error?.code === 'P0001' || error?.code === '22023') throw new RepositoryError('rule', message);
  throw new RepositoryError('unavailable', message);
}

export class SupabasePrivacyRepository implements PrivacyRepository {
  constructor(private readonly client: SupabaseClient) {}

  private async rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
    const { data, error } = await this.client.rpc(name, args);
    if (error) fail(error);
    return data as T;
  }

  async requests(): Promise<RequestRow[]> {
    const { data, error } = await this.client.from('dsr_requests').select('id, type, status, requester_name, contact, details, subject_ref, received_at, due_at, identity_verified_at, completed_at, exceptions').order('received_at', { ascending: false }).limit(100);
    if (error) fail(error);
    return (data ?? []).map((r) => ({ id: r.id, type: r.type, status: r.status, requesterName: r.requester_name, contact: r.contact, details: r.details, subjectRef: r.subject_ref, receivedAt: r.received_at, dueAt: r.due_at, identityVerifiedAt: r.identity_verified_at, completedAt: r.completed_at, exceptions: r.exceptions }));
  }

  createRequest(input: { type: string; requester: string; contact: string; details: string; customerId: string | null }) {
    return this.rpc<string>('create_dsr', { p_type: input.type, p_requester: input.requester, p_contact: input.contact, p_details: input.details, p_customer: input.customerId });
  }

  async updateRequest(id: string, status: string, exceptions: string | null, identityVerified: boolean | null) {
    await this.rpc('update_dsr', { p_id: id, p_status: status, p_exceptions: exceptions, p_identity_verified: identityVerified });
  }

  async subject(customerId: string): Promise<SubjectInfo | null> {
    const { data, error } = await this.client.from('customers').select('id, full_name, restricted_at, anonymised_at').eq('id', customerId).maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const { data: consents, error: consentError } = await this.client.from('consent_records').select('purpose, given_at, withdrawn_at').eq('customer_id', customerId).order('given_at', { ascending: false });
    if (consentError) fail(consentError);
    return { id: data.id, fullName: data.full_name, restricted: Boolean(data.restricted_at), anonymised: Boolean(data.anonymised_at), consents: (consents ?? []).map((c) => ({ purpose: c.purpose, givenAt: c.given_at, withdrawnAt: c.withdrawn_at })) };
  }

  exportSubject(customerId: string, requestId: string | null) {
    return this.rpc<unknown>('export_subject', { p_customer: customerId, p_dsr: requestId });
  }

  anonymiseSubject(customerId: string, requestId: string | null) {
    return this.rpc<Record<string, number>>('anonymise_subject', { p_customer: customerId, p_dsr: requestId });
  }

  async restrict(customerId: string, restricted: boolean) {
    await this.rpc('set_processing_restriction', { p_customer: customerId, p_restricted: restricted });
  }

  withdrawConsent(customerId: string, purpose: string) {
    return this.rpc<number>('withdraw_consent', { p_customer: customerId, p_purpose: purpose, p_channel: 'staff' });
  }

  async incidents(): Promise<IncidentRow[]> {
    const { data, error } = await this.client.from('privacy_incidents').select('id, detected_at, aware_at, summary, data_categories, people_affected, risk_level, authority_notified_at, individuals_notified_at, decision_reason, status').order('detected_at', { ascending: false });
    if (error) fail(error);
    return (data ?? []).map((i) => ({ id: i.id, detectedAt: i.detected_at, awareAt: i.aware_at, summary: i.summary, dataCategories: i.data_categories, peopleAffected: i.people_affected, riskLevel: i.risk_level, authorityNotifiedAt: i.authority_notified_at, individualsNotifiedAt: i.individuals_notified_at, decisionReason: i.decision_reason, status: i.status }));
  }

  async createIncident(input: IncidentInput) {
    const { data: auth } = await this.client.auth.getUser();
    const { error } = await this.client.from('privacy_incidents').insert({
      detected_at: input.detectedAt, aware_at: input.awareAt, summary: input.summary, data_categories: input.dataCategories, people_affected: input.peopleAffected, risk_level: input.riskLevel, owner_id: auth.user?.id ?? null,
    });
    if (error) fail(error);
  }

  async updateIncident(id: string, patch: { status?: string; riskLevel?: string; authorityNotifiedAt?: string | null; individualsNotifiedAt?: string | null; decisionReason?: string | null }) {
    const row: Record<string, unknown> = {};
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.riskLevel !== undefined) row.risk_level = patch.riskLevel;
    if (patch.authorityNotifiedAt !== undefined) row.authority_notified_at = patch.authorityNotifiedAt;
    if (patch.individualsNotifiedAt !== undefined) row.individuals_notified_at = patch.individualsNotifiedAt;
    if (patch.decisionReason !== undefined) row.decision_reason = patch.decisionReason;
    const { data, error } = await this.client.from('privacy_incidents').update(row).eq('id', id).select('id');
    if (error) fail(error);
    if (!data?.length) throw new RepositoryError('forbidden', 'no row changed');
  }
}
