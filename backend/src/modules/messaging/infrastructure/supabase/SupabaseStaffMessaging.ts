import type { SupabaseClient } from '@supabase/supabase-js';
import { StaffRepositoryError, type MessageRow, type NotificationRow, type RuleRow, type StaffMessagingRepository, type TemplateGroup, type TemplateVersion } from '../../application';

type Failure = { code?: string; message: string } | null;
const PAGE = 25;

function fail(error: Failure): never {
  const message = error?.message ?? 'unknown';
  if (error?.code === '42501') throw new StaffRepositoryError('forbidden', message);
  if (error?.code === 'P0001' || error?.code === '22023') throw new StaffRepositoryError('rule', message);
  throw new StaffRepositoryError('unavailable', message);
}

export class SupabaseStaffMessaging implements StaffMessagingRepository {
  constructor(private readonly client: SupabaseClient) {}

  async notifications(page: number) {
    const { data, count, error } = await this.client.from('notifications').select('id, kind, title, body, link, created_at, read_at', { count: 'exact' }).order('created_at', { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
    if (error) fail(error);
    return {
      rows: (data ?? []).map((n): NotificationRow => ({ id: n.id, kind: n.kind, title: n.title, body: n.body, link: n.link, createdAt: n.created_at, read: Boolean(n.read_at) })),
      total: count ?? 0, unread: await this.unreadCount(),
    };
  }

  async unreadCount() {
    const { count, error } = await this.client.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null);
    if (error) fail(error);
    return count ?? 0;
  }

  async markRead(ids: readonly string[] | null) {
    const { error } = await this.client.rpc('mark_notifications_read', { p_ids: ids ? [...ids] : null });
    if (error) fail(error);
  }

  async messages(status: string | undefined, page: number) {
    let query = this.client.from('messages').select('id, channel, provider, to_address, template_key, subject, body, status, error, created_at, customers(full_name)', { count: 'exact' });
    if (status) query = query.eq('status', status);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
    if (error) fail(error);
    return {
      rows: ((data ?? []) as unknown as { id: string; channel: 'email' | 'whatsapp'; provider: string; to_address: string | null; template_key: string | null; subject: string | null; body: string; status: string; error: string | null; created_at: string; customers: { full_name: string } | null }[])
        .map((m): MessageRow => ({ id: m.id, channel: m.channel, provider: m.provider, to: m.to_address, templateKey: m.template_key, subject: m.subject, body: m.body, status: m.status, error: m.error, createdAt: m.created_at, customerName: m.customers?.full_name ?? null })),
      total: count ?? 0,
    };
  }

  async templates(): Promise<TemplateGroup[]> {
    const { data, error } = await this.client.from('message_templates').select('key, channel, version, subject, body, is_active, created_at').order('key').order('version', { ascending: false });
    if (error) fail(error);
    type Group = { key: string; channel: 'email' | 'whatsapp'; versions: TemplateVersion[] };
    const groups = new Map<string, Group>();
    for (const t of data ?? []) {
      const id = `${t.key}:${t.channel}`;
      const group: Group = groups.get(id) ?? { key: t.key, channel: t.channel, versions: [] };
      group.versions.push({ version: t.version, subject: t.subject, body: t.body, isActive: t.is_active, createdAt: t.created_at });
      groups.set(id, group);
    }
    return [...groups.values()];
  }

  async saveTemplate(key: string, channel: 'email' | 'whatsapp', subject: string | null, body: string) {
    const { data, error } = await this.client.rpc('save_template', { p_key: key, p_channel: channel, p_subject: subject, p_body: body });
    if (error) fail(error);
    return data as number;
  }

  async activateVersion(key: string, channel: 'email' | 'whatsapp', version: number) {
    const { error } = await this.client.rpc('activate_template_version', { p_key: key, p_channel: channel, p_version: version });
    if (error) fail(error);
  }

  async rules(): Promise<RuleRow[]> {
    const { data, error } = await this.client.from('notification_rules').select('id, event, channel, template_key, recipient_type, recipient_ref, enabled').order('event').order('channel');
    if (error) fail(error);
    return (data ?? []).map((r) => ({ id: r.id, event: r.event, channel: r.channel, templateKey: r.template_key, recipient: r.recipient_type === 'staff_role' ? `staff: ${r.recipient_ref}` : r.recipient_type, enabled: r.enabled }));
  }

  async setRuleEnabled(id: string, enabled: boolean) {
    const { error } = await this.client.rpc('set_rule_enabled', { p_rule: id, p_enabled: enabled });
    if (error) fail(error);
  }

  async queueManual(customerId: string, orderId: string | null, templateKey: string, channel: 'email' | 'whatsapp') {
    const { error } = await this.client.rpc('queue_manual_message', { p_customer: customerId, p_order: orderId, p_template: templateKey, p_channel: channel });
    if (error) fail(error);
  }

  async customerPhone(customerId: string) {
    const { data, error } = await this.client.from('customers').select('full_name, phone_e164').eq('id', customerId).maybeSingle();
    if (error) fail(error);
    return data ? { name: data.full_name, phone: data.phone_e164 } : null;
  }

  async activeTemplate(key: string, channel: 'email' | 'whatsapp') {
    const { data, error } = await this.client.from('message_templates').select('subject, body').eq('key', key).eq('channel', channel).eq('is_active', true).maybeSingle();
    if (error) fail(error);
    return data ? { subject: data.subject, body: data.body } : null;
  }
}
