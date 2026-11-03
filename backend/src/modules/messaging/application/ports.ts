import type { BusinessInfo, Channel, EventContext, MessageRecord, OutboxEvent, Rule, StaffRecipient, Template } from '../domain';

export interface OutboxStore {
  claim(limit: number): Promise<readonly OutboxEvent[]>;
  complete(id: number): Promise<void>;
  /** Records a failed attempt; the store applies backoff and reports whether the event is now final. */
  fail(id: number, error: string): Promise<'retry' | 'failed' | 'missing'>;
  defer(id: number, until: Date, reason: string): Promise<void>;
}

export interface RuleStore { enabledFor(event: string): Promise<readonly Rule[]> }
export interface TemplateStore { active(key: string, channel: Channel, locale: string): Promise<Template | null> }
export interface ContextLoader { load(event: OutboxEvent): Promise<EventContext> }
export interface StaffDirectory { recipients(role: string | null): Promise<readonly StaffRecipient[]>; byId(userId: string): Promise<StaffRecipient | null> }

export interface MessageLog {
  /** Idempotent: returns false (and changes nothing) when the key already exists. */
  create(message: MessageRecord): Promise<boolean>;
  update(idempotencyKey: string, patch: { status: MessageRecord['status']; providerId?: string | null; error?: string | null }): Promise<void>;
  status(idempotencyKey: string): Promise<MessageRecord['status'] | null>;
  sentToday(customerId: string, since: Date): Promise<number>;
}

export interface NotificationStore {
  create(input: { userId: string; kind: 'info' | 'action' | 'alert'; title: string; body: string | null; link: string | null; outboxId: number }): Promise<void>;
}

export interface EmailAttachment { readonly filename: string; readonly content: Uint8Array; readonly contentType: string }

export interface EmailSender {
  readonly id: string;
  send(message: { to: string; subject: string; text: string; html: string; idempotencyKey: string; attachments?: readonly EmailAttachment[] }): Promise<{ providerId: string }>;
}

/** Files that travel with an event's email (for example the invoice PDF). Returns an empty list when there is nothing to attach. */
export interface AttachmentProvider { forEvent(event: OutboxEvent): Promise<readonly EmailAttachment[]> }

export interface WorkerSettings {
  readonly enabled: boolean;
  readonly batchSize: number;
  readonly quietStart: string;
  readonly quietEnd: string;
  readonly timeZone: string;
  readonly dailyCap: number;
  /** WhatsApp has no automated provider yet; rules for it are skipped with a visible status. */
  readonly whatsappAvailable: boolean;
  readonly business: () => Promise<BusinessInfo>;
}

export interface Clock { now(): Date }
