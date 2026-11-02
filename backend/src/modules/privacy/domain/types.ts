export const REQUEST_TYPES = ['access', 'rectification', 'erasure', 'restriction', 'portability', 'objection', 'withdrawal', 'grievance'] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];
export const REQUEST_STATUSES = ['received', 'verifying', 'in_progress', 'completed', 'rejected', 'extended'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface RequestRow {
  readonly id: string;
  readonly type: RequestType;
  readonly status: RequestStatus;
  readonly requesterName: string | null;
  readonly contact: string | null;
  readonly details: string | null;
  readonly subjectRef: string;
  readonly receivedAt: string;
  readonly dueAt: string;
  readonly identityVerifiedAt: string | null;
  readonly completedAt: string | null;
  readonly exceptions: string | null;
}

export interface SubjectInfo {
  readonly id: string;
  readonly fullName: string;
  readonly restricted: boolean;
  readonly anonymised: boolean;
  readonly consents: readonly { purpose: string; givenAt: string; withdrawnAt: string | null }[];
}

export interface IncidentRow {
  readonly id: string;
  readonly detectedAt: string;
  readonly awareAt: string;
  readonly summary: string;
  readonly dataCategories: readonly string[];
  readonly peopleAffected: number | null;
  readonly riskLevel: string;
  readonly authorityNotifiedAt: string | null;
  readonly individualsNotifiedAt: string | null;
  readonly decisionReason: string | null;
  readonly status: string;
}

export const CONSENT_PURPOSES = ['enquiry_reply', 'marketing_email', 'whatsapp_updates', 'photo_publication'] as const;
