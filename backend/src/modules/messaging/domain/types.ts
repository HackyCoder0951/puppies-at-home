export type Channel = 'email' | 'whatsapp';

export interface OutboxEvent {
  readonly id: number;
  readonly event: string;
  readonly entity: string;
  readonly entityId: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly attempts: number;
}

export interface Rule {
  readonly id: string;
  readonly event: string;
  readonly channel: Channel | 'in_app';
  readonly templateKey: string | null;
  readonly recipientType: 'customer' | 'assignee' | 'staff_role';
  readonly recipientRef: string | null;
  readonly respectQuietHours: boolean;
  readonly inAppTitle: string | null;
  readonly inAppBody: string | null;
}

export interface Template { readonly key: string; readonly channel: Channel; readonly subject: string | null; readonly body: string; readonly version: number }

export interface CustomerInfo {
  readonly id: string;
  readonly fullName: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly emailAllowed: boolean;
  readonly whatsappAllowed: boolean;
  readonly whatsappOptedIn: boolean;
}

/** Everything a template may mention, loaded for one event. All parts are optional. */
export interface EventContext {
  readonly customer?: CustomerInfo;
  readonly vars: Readonly<Record<string, string>>;
  readonly assigneeId?: string;
  readonly link?: string;
}

export interface StaffRecipient { readonly userId: string; readonly role: 'super_admin' | 'operator' }

export interface BusinessInfo { readonly name: string; readonly phone: string; readonly whatsappUrl: string }

export interface MessageRecord {
  readonly idempotencyKey: string;
  readonly customerId: string | null;
  readonly orderId: string | null;
  readonly channel: Channel;
  readonly provider: string;
  readonly to: string | null;
  readonly templateKey: string | null;
  readonly subject: string | null;
  readonly body: string;
  readonly status: 'queued' | 'sent' | 'failed' | 'handed_off' | 'skipped';
  readonly providerId?: string | null;
  readonly error?: string | null;
  readonly sentBy?: string | null;
  readonly outboxId: number;
}
