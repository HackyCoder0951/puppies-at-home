/**
 * Public API of the messaging module. `createServiceOutboxWorker` takes the service-role client from the cron route
 * (the only place allowed to create one) and wires stores, the email provider chosen by `EMAIL_PROVIDER` and the
 * limits from the environment.
 */
import { getEnv } from '@backend/config';
import { createOutboxWorker, createStaffMessaging, type EmailAttachment, type EmailSender, type OutboxWorker, type StaffMessaging } from './application';
import { invoicePdfFor } from '@backend/modules/billing';
import { createSessionClient, type SupabaseClient } from '@platform';
import type { OutboxEvent } from './domain';
import { LogEmailSender, ResendEmailSender, SupabaseContextLoader, SupabaseMessageLog, SupabaseNotificationStore, SupabaseOutboxStore, SupabaseRuleStore, SupabaseStaffMessaging, SupabaseStaffDirectory, SupabaseTemplateStore, loadBusinessInfo } from './infrastructure';

export { moduleDefinition } from './module.config';
export type { OutboxWorker, RunSummary, StaffMessaging, StaffMessagingError, NotificationRow, MessageRow, TemplateGroup, TemplateVersion, RuleRow } from './application';
export { TEMPLATE_VARIABLES, SAMPLE_VARIABLES } from './domain';
export { messagingMessage, MESSAGE_STATUS_LABEL } from './presentation';

/** Staff-facing messaging (notifications, log, templates, rules) for one signed-in request. */
export async function createStaffMessagingFor(): Promise<StaffMessaging> {
  return createStaffMessaging(new SupabaseStaffMessaging(await createSessionClient()));
}

export function createServiceOutboxWorker(db: SupabaseClient): OutboxWorker {
  const env = getEnv();
  const email: EmailSender = env.EMAIL_PROVIDER === 'resend' && env.RESEND_API_KEY && env.EMAIL_FROM ? new ResendEmailSender(env.RESEND_API_KEY, env.EMAIL_FROM) : new LogEmailSender();
  return createOutboxWorker({
    outbox: new SupabaseOutboxStore(db), rules: new SupabaseRuleStore(db), templates: new SupabaseTemplateStore(db), context: new SupabaseContextLoader(db),
    staff: new SupabaseStaffDirectory(db), messages: new SupabaseMessageLog(db), notifications: new SupabaseNotificationStore(db), email, attachments: { forEvent: (event) => invoiceAttachments(db, event) }, clock: { now: () => new Date() },
    settings: {
      enabled: env.FEATURE_OUTBOX_ENABLED, batchSize: 20, quietStart: env.QUIET_HOURS_START, quietEnd: env.QUIET_HOURS_END, timeZone: env.QUIET_HOURS_TZ, dailyCap: env.AUTOMATED_MSG_DAILY_CAP,
      whatsappAvailable: false, business: () => loadBusinessInfo(db),
    },
  });
}

/** The invoice PDF travels with the `invoice.issued` email; other events carry no files. */
async function invoiceAttachments(db: SupabaseClient, event: OutboxEvent): Promise<readonly EmailAttachment[]> {
  if (event.event !== 'invoice.issued') return [];
  const id = typeof event.payload.invoiceId === 'string' ? event.payload.invoiceId : event.entity === 'invoice' ? event.entityId : null;
  const pdf = id ? await invoicePdfFor(db, id) : null;
  return pdf ? [{ filename: pdf.filename, content: pdf.bytes, contentType: 'application/pdf' }] : [];
}
