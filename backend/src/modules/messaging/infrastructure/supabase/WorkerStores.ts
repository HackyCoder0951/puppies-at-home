import type { SupabaseClient } from '@supabase/supabase-js';
import type { BusinessInfo, Channel, CustomerInfo, EventContext, MessageRecord, OutboxEvent, Rule, StaffRecipient, Template } from '../../domain';
import { formatMoney, firstName } from '../../domain';
import type { ContextLoader, MessageLog, NotificationStore, OutboxStore, RuleStore, StaffDirectory, TemplateStore } from '../../application';

const check = (error: { message: string } | null, what: string) => {
  if (error) throw new Error(`${what}: ${error.message}`);
};

/** All stores take a service-role client handed in by the cron route (the only caller allowed to create one). */
export class SupabaseOutboxStore implements OutboxStore {
  constructor(private readonly db: SupabaseClient) {}

  async claim(limit: number): Promise<OutboxEvent[]> {
    const { data, error } = await this.db.rpc('claim_outbox', { p_limit: limit });
    check(error, 'claim outbox');
    return ((data ?? []) as { id: number; event: string; entity: string; entity_id: string; payload: Record<string, unknown>; attempts: number }[]).map((r) => ({
      id: r.id, event: r.event, entity: r.entity, entityId: r.entity_id, payload: r.payload ?? {}, attempts: r.attempts,
    }));
  }

  async complete(id: number) {
    check((await this.db.rpc('complete_outbox', { p_id: id })).error, 'complete outbox');
  }

  async fail(id: number, error: string) {
    const { data, error: rpcError } = await this.db.rpc('fail_outbox', { p_id: id, p_error: error });
    check(rpcError, 'fail outbox');
    return data as 'retry' | 'failed' | 'missing';
  }

  async defer(id: number, until: Date, reason: string) {
    check((await this.db.rpc('defer_outbox', { p_id: id, p_until: until.toISOString(), p_reason: reason })).error, 'defer outbox');
  }
}

export class SupabaseRuleStore implements RuleStore {
  constructor(private readonly db: SupabaseClient) {}

  async enabledFor(event: string): Promise<Rule[]> {
    const { data, error } = await this.db.from('notification_rules').select('id, event, channel, template_key, recipient_type, recipient_ref, respect_quiet_hours, in_app_title, in_app_body').eq('event', event).eq('enabled', true);
    check(error, 'rules');
    return (data ?? []).map((r) => ({
      id: r.id, event: r.event, channel: r.channel, templateKey: r.template_key, recipientType: r.recipient_type, recipientRef: r.recipient_ref, respectQuietHours: r.respect_quiet_hours, inAppTitle: r.in_app_title, inAppBody: r.in_app_body,
    }));
  }
}

export class SupabaseTemplateStore implements TemplateStore {
  constructor(private readonly db: SupabaseClient) {}

  async active(key: string, channel: Channel, locale: string): Promise<Template | null> {
    const { data, error } = await this.db.from('message_templates').select('key, channel, subject, body, version').eq('key', key).eq('channel', channel).eq('locale', locale).eq('is_active', true).maybeSingle();
    check(error, 'template');
    return data ? { key: data.key, channel: data.channel, subject: data.subject, body: data.body, version: data.version } : null;
  }
}

export class SupabaseStaffDirectory implements StaffDirectory {
  constructor(private readonly db: SupabaseClient) {}

  async recipients(role: string | null): Promise<StaffRecipient[]> {
    let query = this.db.from('profiles').select('user_id, role').is('disabled_at', null);
    if (role) query = query.eq('role', role);
    const { data, error } = await query;
    check(error, 'staff');
    return (data ?? []).map((p) => ({ userId: p.user_id, role: p.role }));
  }

  async byId(userId: string): Promise<StaffRecipient | null> {
    const { data, error } = await this.db.from('profiles').select('user_id, role').eq('user_id', userId).is('disabled_at', null).maybeSingle();
    check(error, 'staff member');
    return data ? { userId: data.user_id, role: data.role } : null;
  }
}

export class SupabaseMessageLog implements MessageLog {
  constructor(private readonly db: SupabaseClient) {}

  async create(m: MessageRecord) {
    const { data, error } = await this.db.from('messages').upsert({
      idempotency_key: m.idempotencyKey, customer_id: m.customerId, order_id: m.orderId, channel: m.channel, provider: m.provider, to_address: m.to, template_key: m.templateKey,
      subject: m.subject, body: m.body, status: m.status, provider_id: m.providerId ?? null, error: m.error ?? null, sent_by: m.sentBy ?? null, outbox_id: m.outboxId,
    }, { onConflict: 'idempotency_key', ignoreDuplicates: true }).select('id');
    check(error, 'message log');
    return (data ?? []).length > 0;
  }

  async update(key: string, patch: { status: MessageRecord['status']; providerId?: string | null; error?: string | null }) {
    const row: Record<string, unknown> = { status: patch.status, updated_at: new Date().toISOString() };
    if (patch.providerId !== undefined) row.provider_id = patch.providerId;
    if (patch.error !== undefined) row.error = patch.error;
    check((await this.db.from('messages').update(row).eq('idempotency_key', key)).error, 'message update');
  }

  async status(key: string) {
    const { data, error } = await this.db.from('messages').select('status').eq('idempotency_key', key).maybeSingle();
    check(error, 'message status');
    return (data?.status as MessageRecord['status'] | undefined) ?? null;
  }

  /** Automated messages sent to this customer since the cutoff (staff-initiated sends do not count). */
  async sentToday(customerId: string, since: Date) {
    const { count, error } = await this.db.from('messages').select('id', { count: 'exact', head: true }).eq('customer_id', customerId).eq('status', 'sent').is('sent_by', null).gte('created_at', since.toISOString());
    check(error, 'message count');
    return count ?? 0;
  }
}

export class SupabaseNotificationStore implements NotificationStore {
  constructor(private readonly db: SupabaseClient) {}

  async create(n: { userId: string; kind: 'info' | 'action' | 'alert'; title: string; body: string | null; link: string | null; outboxId: number }) {
    const { error } = await this.db.from('notifications').upsert({ user_id: n.userId, kind: n.kind, title: n.title, body: n.body, link: n.link, outbox_id: n.outboxId }, { onConflict: 'user_id,outbox_id,title', ignoreDuplicates: true });
    check(error, 'notification');
  }
}

/** Reads the business details used in templates from the public settings. */
export async function loadBusinessInfo(db: SupabaseClient): Promise<BusinessInfo> {
  const { data, error } = await db.from('site_settings').select('key, value').in('key', ['phone_href', 'whatsapp_number']);
  check(error, 'business info');
  const s = new Map((data ?? []).map((r: { key: string; value: unknown }) => [r.key, String(r.value)]));
  const phone = (s.get('phone_href') ?? '').replace(/^tel:/, '');
  return { name: 'TeddyPups U.A.E.', phone, whatsappUrl: s.get('whatsapp_number') ? `https://wa.me/${s.get('whatsapp_number')}` : '' };
}

export class SupabaseContextLoader implements ContextLoader {
  constructor(private readonly db: SupabaseClient) {}

  private async one<T>(table: string, columns: string, id: unknown): Promise<T | null> {
    if (typeof id !== 'string') return null;
    const { data, error } = await this.db.from(table).select(columns).eq('id', id).maybeSingle();
    check(error, table);
    return (data as T | null) ?? null;
  }

  async load(event: OutboxEvent): Promise<EventContext> {
    const p = event.payload;
    const vars: Record<string, string> = {};
    let customer: CustomerInfo | undefined;
    let link: string | undefined;

    const c = await this.one<{ id: string; full_name: string; email: string | null; phone_e164: string | null; notification_prefs: { email?: boolean; whatsapp?: boolean } | null; whatsapp_opt_in_at: string | null; whatsapp_opted_out_at: string | null; restricted_at: string | null }>(
      'customers', 'id, full_name, email, phone_e164, notification_prefs, whatsapp_opt_in_at, whatsapp_opted_out_at, restricted_at', p.customerId);
    if (c) {
      customer = {
        id: c.id, fullName: c.full_name, email: c.email, phone: c.phone_e164, emailAllowed: c.notification_prefs?.email !== false, whatsappAllowed: c.notification_prefs?.whatsapp === true || Boolean(c.whatsapp_opt_in_at),
        whatsappOptedIn: Boolean(c.whatsapp_opt_in_at) && !c.whatsapp_opted_out_at, restricted: Boolean(c.restricted_at),
      };
      vars['customer.name'] = c.full_name;
      vars['customer.first_name'] = firstName(c.full_name);
    }

    const order = await this.one<{ number: string; status: string; total_minor: number; tax_minor: number; balance_minor: number; currency: string; puppies: { name: string | null; breed: string } | null }>(
      'orders', 'number, status, total_minor, tax_minor, balance_minor, currency, puppies(name, breed)', p.orderId);
    if (order) {
      vars['order.number'] = order.number;
      vars['order.status'] = order.status.replace(/_/g, ' ');
      vars['order.total'] = formatMoney(Number(order.total_minor) + Number(order.tax_minor), order.currency);
      vars['order.balance'] = formatMoney(Number(order.balance_minor), order.currency);
      vars['puppy.name'] = order.puppies?.name ?? order.puppies?.breed ?? '';
      vars['puppy.breed'] = order.puppies?.breed ?? '';
      link = `/admin/orders/${String(p.orderId)}`;
      // A pending hosted-checkout payment supplies the link for the payment_link template.
      const { data: pending, error: pendingError } = await this.db.from('payments').select('amount_minor, currency, raw').eq('order_id', p.orderId).eq('status', 'pending').order('created_at', { ascending: false }).limit(1).maybeSingle();
      check(pendingError, 'pending payment');
      const pendingUrl = (pending?.raw as { url?: string } | null)?.url;
      if (pendingUrl) {
        vars['payment.link'] = pendingUrl;
        vars['payment.amount'] = formatMoney(Number(pending?.amount_minor), pending?.currency ?? 'AED');
      }
    }

    const invoice = await this.one<{ number: string | null; total_minor: number; due_at: string | null; currency: string }>('invoices', 'number, total_minor, due_at, currency', p.invoiceId ?? (event.entity === 'invoice' ? event.entityId : null));
    if (invoice) {
      vars['invoice.number'] = invoice.number ?? '';
      vars['invoice.total'] = formatMoney(Number(invoice.total_minor), invoice.currency);
      vars['invoice.due_date'] = invoice.due_at ?? '';
      link = `/admin/invoices/${String(p.invoiceId ?? event.entityId)}`;
    }

    const payment = await this.one<{ amount_minor: number; method: string; gateway_ref: string; currency: string }>('payments', 'amount_minor, method, gateway_ref, currency', p.paymentId);
    if (payment) {
      vars['payment.amount'] = formatMoney(Number(payment.amount_minor), payment.currency);
      vars['payment.method'] = payment.method.replace(/_/g, ' ');
      vars['payment.reference'] = payment.gateway_ref;
    }
    const refund = await this.one<{ amount_minor: number }>('refunds', 'amount_minor', p.refundId);
    if (refund) {
      vars['refund.amount'] = formatMoney(Number(refund.amount_minor));
      link = '/admin/payments';
    }

    const delivery = await this.one<{ method: string; carrier: string | null; tracking_no: string | null; eta: string | null }>('deliveries', 'method, carrier, tracking_no, eta', p.deliveryId);
    if (delivery) {
      vars['delivery.method'] = delivery.method.replace(/_/g, ' ');
      vars['delivery.carrier'] = delivery.carrier ?? '';
      vars['delivery.tracking_no'] = delivery.tracking_no ?? '';
      vars['delivery.eta'] = delivery.eta ?? '';
      vars['delivery.status'] = String(p.status ?? '').replace(/_/g, ' ');
      vars['delivery.note'] = String(p.note ?? '');
      vars['delivery.location'] = String(p.location ?? '');
    }

    const enquiry = await this.one<{ message: string | null }>('enquiries', 'message', p.enquiryId);
    if (enquiry) {
      vars['enquiry.message'] = (enquiry.message ?? '').slice(0, 200);
      link = `/admin/enquiries/${String(p.enquiryId)}`;
    }

    return { customer, vars, assigneeId: typeof p.assignedTo === 'string' ? p.assignedTo : undefined, link };
  }
}
