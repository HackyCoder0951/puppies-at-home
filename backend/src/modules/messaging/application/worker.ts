import { isQuietHour, renderTemplate, textToHtml, type BusinessInfo, type Channel, type CustomerInfo, type EventContext, type OutboxEvent, type Rule } from '../domain';
import type { AttachmentProvider, Clock, ContextLoader, EmailSender, MessageLog, NotificationStore, OutboxStore, RuleStore, StaffDirectory, TemplateStore, WorkerSettings } from './ports';

export interface WorkerDeps {
  outbox: OutboxStore;
  rules: RuleStore;
  templates: TemplateStore;
  context: ContextLoader;
  staff: StaffDirectory;
  messages: MessageLog;
  notifications: NotificationStore;
  email: EmailSender;
  /** Optional: files attached to customer emails for some events. */
  attachments?: AttachmentProvider;
  clock: Clock;
  settings: WorkerSettings;
}

export interface RunSummary { claimed: number; done: number; retried: number; failed: number; deferred: number; sent: number; skipped: number; notified: number }

const DAY_MS = 24 * 60 * 60 * 1000;

/** Result of handling one rule for one event: used to build the run summary. */
type Outcome = 'sent' | 'skipped' | 'notified' | 'deferred';

export function createOutboxWorker(deps: WorkerDeps) {
  const { settings } = deps;

  const baseVars = (context: EventContext, business: BusinessInfo): Record<string, string> => ({
    'business.name': business.name, 'business.phone': business.phone, 'business.whatsapp_url': business.whatsappUrl, ...context.vars,
  });

  /** Customer rules: preference, consent, quiet hours and caps, then render and send (or record why not). */
  async function sendToCustomer(event: OutboxEvent, rule: Rule, channel: Channel, templateKey: string, context: EventContext, vars: Record<string, string>, extra: { sentBy?: string | null; locale?: string } = {}): Promise<Outcome> {
    const customer: CustomerInfo | undefined = context.customer;
    const key = `outbox:${event.id}:${rule.id}:${channel}`;
    const base = { idempotencyKey: key, customerId: customer?.id ?? null, orderId: typeof event.payload.orderId === 'string' ? event.payload.orderId : null, channel, templateKey, outboxId: event.id, sentBy: extra.sentBy ?? null };
    const skip = async (reason: string): Promise<Outcome> => {
      await deps.messages.create({ ...base, provider: channel === 'email' ? deps.email.id : 'none', to: null, subject: null, body: '', status: 'skipped', error: reason });
      return 'skipped';
    };
    if (!customer) return skip('no customer');
    if (customer.restricted) return skip('processing restricted');
    if (channel === 'whatsapp' && !settings.whatsappAvailable) return skip('channel unavailable');
    if (channel === 'email' && (!customer.email || !customer.emailAllowed)) return skip(customer.email ? 'customer turned email off' : 'no email address');
    if (channel === 'whatsapp' && (!customer.phone || !customer.whatsappAllowed || !customer.whatsappOptedIn)) return skip('no WhatsApp consent');

    const now = deps.clock.now();
    if (rule.respectQuietHours && isQuietHour(now, settings.quietStart, settings.quietEnd, settings.timeZone)) return 'deferred';
    if ((await deps.messages.sentToday(customer.id, new Date(now.getTime() - DAY_MS))) >= settings.dailyCap && extra.sentBy == null) return skip('daily cap reached');

    const template = await deps.templates.active(templateKey, channel, extra.locale ?? 'en');
    if (!template) return skip('no active template');
    const subject = template.subject ? renderTemplate(template.subject, vars) : '';
    const text = renderTemplate(template.body, vars);
    const to = channel === 'email' ? customer.email : customer.phone;
    const created = await deps.messages.create({ ...base, provider: deps.email.id, to, subject, body: text, status: 'queued' });
    if (!created && (await deps.messages.status(key)) === 'sent') return 'sent';
    try {
      const attachments = channel === 'email' && deps.attachments ? await deps.attachments.forEvent(event) : [];
      const sent = await deps.email.send({ to: to ?? '', subject, text, html: textToHtml(text), idempotencyKey: key, ...(attachments.length ? { attachments } : {}) });
      await deps.messages.update(key, { status: 'sent', providerId: sent.providerId, error: null });
      return 'sent';
    } catch (error) {
      await deps.messages.update(key, { status: 'failed', error: String(error).slice(0, 300) });
      throw error;
    }
  }

  async function notifyStaff(event: OutboxEvent, rule: Rule, context: EventContext, vars: Record<string, string>): Promise<Outcome> {
    const targets =
      rule.recipientType === 'assignee'
        ? context.assigneeId ? [await deps.staff.byId(context.assigneeId)] : []
        : await deps.staff.recipients(rule.recipientRef === 'any' ? null : rule.recipientRef);
    const title = renderTemplate(rule.inAppTitle ?? '', vars);
    const body = renderTemplate(rule.inAppBody ?? '', vars) || null;
    const kind = rule.event === 'refund.requested' ? 'action' : rule.event === 'delivery.delayed' || rule.event === 'order.cancelled' ? 'alert' : 'info';
    let count = 0;
    for (const person of targets) {
      if (!person) continue;
      await deps.notifications.create({ userId: person.userId, kind, title, body, link: context.link ?? null, outboxId: event.id });
      count += 1;
    }
    return count ? 'notified' : 'skipped';
  }

  /** Staff email (for example the daily digest): one message per active staff member with a sign-in email, each logged and idempotent. */
  async function emailStaff(event: OutboxEvent, rule: Rule, templateKey: string, vars: Record<string, string>): Promise<Outcome> {
    const template = await deps.templates.active(templateKey, 'email', 'en');
    if (!template) return 'skipped';
    const subject = template.subject ? renderTemplate(template.subject, vars) : '';
    const text = renderTemplate(template.body, vars);
    let sent = 0;
    for (const person of await deps.staff.recipients(rule.recipientRef === 'any' ? null : rule.recipientRef)) {
      const to = await deps.staff.emailOf(person.userId);
      if (!to) continue;
      const key = `outbox:${event.id}:${rule.id}:email:${person.userId}`;
      const created = await deps.messages.create({ idempotencyKey: key, customerId: null, orderId: null, channel: 'email', templateKey, outboxId: event.id, sentBy: null, provider: deps.email.id, to, subject, body: text, status: 'queued' });
      if (!created && (await deps.messages.status(key)) === 'sent') { sent += 1; continue; }
      try {
        const result = await deps.email.send({ to, subject, text, html: textToHtml(text), idempotencyKey: key });
        await deps.messages.update(key, { status: 'sent', providerId: result.providerId, error: null });
        sent += 1;
      } catch (error) {
        await deps.messages.update(key, { status: 'failed', error: String(error).slice(0, 300) });
        throw error;
      }
    }
    return sent ? 'sent' : 'skipped';
  }

  async function handle(event: OutboxEvent): Promise<Outcome[]> {
    const context = await deps.context.load(event);
    const vars = baseVars(context, await settings.business());
    if (event.event === 'manual.message') {
      const templateKey = String(event.payload.templateKey ?? '');
      const channel = event.payload.channel === 'whatsapp' ? 'whatsapp' : 'email';
      const manual: Rule = { id: 'manual', event: event.event, channel, templateKey, recipientType: 'customer', recipientRef: null, respectQuietHours: false, inAppTitle: null, inAppBody: null };
      const sentBy = typeof event.payload.sentBy === 'string' ? event.payload.sentBy : null;
      return [await sendToCustomer(event, manual, channel, templateKey, context, vars, { sentBy })];
    }
    const outcomes: Outcome[] = [];
    for (const rule of await deps.rules.enabledFor(event.event)) {
      if (rule.channel === 'in_app') outcomes.push(await notifyStaff(event, rule, context, vars));
      else if (rule.recipientType === 'staff_role' && rule.channel === 'email' && rule.templateKey) outcomes.push(await emailStaff(event, rule, rule.templateKey, vars));
      else if (rule.recipientType === 'customer' && rule.templateKey) outcomes.push(await sendToCustomer(event, rule, rule.channel, rule.templateKey, context, vars));
    }
    return outcomes;
  }

  /** One run: claim a batch and handle each event independently so one failure never blocks the rest. */
  async function run(): Promise<RunSummary> {
    const summary: RunSummary = { claimed: 0, done: 0, retried: 0, failed: 0, deferred: 0, sent: 0, skipped: 0, notified: 0 };
    if (!settings.enabled) return summary;
    const events = await deps.outbox.claim(settings.batchSize);
    summary.claimed = events.length;
    for (const event of events) {
      try {
        const outcomes = await handle(event);
        for (const o of outcomes) summary[o === 'deferred' ? 'deferred' : o] += 1;
        if (outcomes.includes('deferred')) {
          await deps.outbox.defer(event.id, new Date(deps.clock.now().getTime() + 30 * 60 * 1000), 'quiet hours');
        } else {
          await deps.outbox.complete(event.id);
          summary.done += 1;
        }
      } catch (error) {
        const result = await deps.outbox.fail(event.id, error instanceof Error ? error.message : String(error));
        if (result === 'failed') summary.failed += 1;
        else summary.retried += 1;
      }
    }
    return summary;
  }

  return { run };
}

export type OutboxWorker = ReturnType<typeof createOutboxWorker>;
