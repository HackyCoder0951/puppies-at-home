import { err, ok, type Result } from '@backend/kernel';
import { renderTemplate, SAMPLE_VARIABLES, TEMPLATE_VARIABLES, whatsappLink } from '../domain';

export type StaffMessagingError = { code: 'invalid'; field?: string } | { code: 'rule'; message: string } | { code: 'forbidden' } | { code: 'unavailable' };

export class StaffRepositoryError extends Error {
  constructor(readonly kind: 'forbidden' | 'rule' | 'unavailable', message: string) {
    super(message);
  }
}

export interface NotificationRow { readonly id: string; readonly kind: 'info' | 'action' | 'alert'; readonly title: string; readonly body: string | null; readonly link: string | null; readonly createdAt: string; readonly read: boolean }
export interface MessageRow { readonly id: string; readonly channel: 'email' | 'whatsapp'; readonly provider: string; readonly to: string | null; readonly templateKey: string | null; readonly subject: string | null; readonly body: string; readonly status: string; readonly error: string | null; readonly createdAt: string; readonly customerName: string | null }
export interface TemplateVersion { readonly version: number; readonly subject: string | null; readonly body: string; readonly isActive: boolean; readonly createdAt: string }
export interface TemplateGroup { readonly key: string; readonly channel: 'email' | 'whatsapp'; readonly versions: readonly TemplateVersion[] }
export interface RuleRow { readonly id: string; readonly event: string; readonly channel: string; readonly templateKey: string | null; readonly recipient: string; readonly enabled: boolean }

export interface StaffMessagingRepository {
  notifications(page: number): Promise<{ rows: readonly NotificationRow[]; total: number; unread: number }>;
  unreadCount(): Promise<number>;
  markRead(ids: readonly string[] | null): Promise<void>;
  messages(status: string | undefined, page: number): Promise<{ rows: readonly MessageRow[]; total: number }>;
  templates(): Promise<readonly TemplateGroup[]>;
  saveTemplate(key: string, channel: 'email' | 'whatsapp', subject: string | null, body: string): Promise<number>;
  activateVersion(key: string, channel: 'email' | 'whatsapp', version: number): Promise<void>;
  rules(): Promise<readonly RuleRow[]>;
  setRuleEnabled(id: string, enabled: boolean): Promise<void>;
  queueManual(customerId: string, orderId: string | null, templateKey: string, channel: 'email' | 'whatsapp'): Promise<void>;
  customerPhone(customerId: string): Promise<{ name: string; phone: string | null } | null>;
  activeTemplate(key: string, channel: 'email' | 'whatsapp'): Promise<{ subject: string | null; body: string } | null>;
}

export function createStaffMessaging(repo: StaffMessagingRepository) {
  async function run<T>(action: () => Promise<T>): Promise<Result<T, StaffMessagingError>> {
    try {
      return ok(await action());
    } catch (error) {
      if (error instanceof StaffRepositoryError) return err(error.kind === 'rule' ? { code: 'rule', message: error.message } : { code: error.kind });
      throw error;
    }
  }
  const channelOf = (v: unknown): 'email' | 'whatsapp' | null => (v === 'email' || v === 'whatsapp' ? v : null);

  return {
    notifications: (page: number) => run(() => repo.notifications(Math.max(1, page))),
    unreadCount: () => run(() => repo.unreadCount()),
    markAllRead: () => run(async () => (await repo.markRead(null), true as const)),
    markRead: (ids: readonly string[]) => run(async () => (await repo.markRead(ids), true as const)),
    messages: (status: string | undefined, page: number) => run(() => repo.messages(status, Math.max(1, page))),
    templates: () => run(() => repo.templates()),
    rules: () => run(() => repo.rules()),
    setRuleEnabled: (id: string, enabled: boolean) => run(async () => (await repo.setRuleEnabled(id, enabled), true as const)),

    async saveTemplate(key: string, rawChannel: unknown, subject: string, body: string): Promise<Result<number, StaffMessagingError>> {
      const channel = channelOf(rawChannel);
      if (!channel) return err({ code: 'invalid', field: 'channel' });
      if (body.trim().length === 0 || body.length > 4000) return err({ code: 'invalid', field: 'body' });
      if (subject.length > 200) return err({ code: 'invalid', field: 'subject' });
      return run(() => repo.saveTemplate(key, channel, subject.trim() || null, body.trim()));
    },
    async activateVersion(key: string, rawChannel: unknown, version: number) {
      const channel = channelOf(rawChannel);
      return channel ? run(async () => (await repo.activateVersion(key, channel, version), true as const)) : err<StaffMessagingError>({ code: 'invalid', field: 'channel' });
    },

    /** Manual email goes through the outbox (same consent, caps and log); WhatsApp returns a prefilled wa.me link. */
    async sendManual(customerId: string, orderId: string | null, templateKey: string, rawChannel: unknown): Promise<Result<{ kind: 'queued' } | { kind: 'link'; url: string }, StaffMessagingError>> {
      const channel = channelOf(rawChannel);
      if (!channel) return err({ code: 'invalid', field: 'channel' });
      if (channel === 'email') return run(async () => (await repo.queueManual(customerId, orderId, templateKey, 'email'), { kind: 'queued' as const }));
      return run(async () => {
        const [customer, template] = await Promise.all([repo.customerPhone(customerId), repo.activeTemplate(templateKey, 'whatsapp')]);
        if (!customer?.phone || !template) throw new StaffRepositoryError('rule', 'This customer has no phone number or the template is not available for WhatsApp.');
        const text = renderTemplate(template.body, { ...SAMPLE_VARIABLES, 'customer.name': customer.name, 'customer.first_name': customer.name.split(/\s+/)[0] ?? '' });
        return { kind: 'link' as const, url: whatsappLink(customer.phone, text) };
      });
    },

    /** Preview with sample data; unknown variables are reported, not hidden. */
    preview(subject: string, body: string) {
      const used = [...`${subject}\n${body}`.matchAll(/\{\{\s*([^}]*?)\s*\}\}/g)].map((m) => m[1] ?? '');
      return { subject: renderTemplate(subject, SAMPLE_VARIABLES), body: renderTemplate(body, SAMPLE_VARIABLES), unknown: used.filter((v) => !(TEMPLATE_VARIABLES as readonly string[]).includes(v)) };
    },
  };
}

export type StaffMessaging = ReturnType<typeof createStaffMessaging>;
