import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { createOutboxWorker } from '@backend/modules/messaging/application';
import {
  LogEmailSender, SupabaseContextLoader, SupabaseMessageLog, SupabaseNotificationStore, SupabaseOutboxStore, SupabaseRuleStore, SupabaseStaffDirectory, SupabaseTemplateStore, loadBusinessInfo,
} from '@backend/modules/messaging/infrastructure';
import { SupabaseEnquiryStore } from '@backend/adapters';

/** Opt-in (seeded local stack): enquiry -> outbox -> worker -> message log and staff notification (T-NOT-01..05, AC-018). */
const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const run = url && anon && service ? describe : describe.skip;

const stamp = Date.now();

run('messaging against the database', () => {
  const db = createClient(url ?? 'http://x', service ?? 'x', { auth: { persistSession: false } });
  const anonClient = createClient(url ?? 'http://x', anon ?? 'x', { auth: { persistSession: false } });
  const staffIds: string[] = [];
  const worker = () => createOutboxWorker({
    outbox: new SupabaseOutboxStore(db), rules: new SupabaseRuleStore(db), templates: new SupabaseTemplateStore(db), context: new SupabaseContextLoader(db), staff: new SupabaseStaffDirectory(db),
    messages: new SupabaseMessageLog(db), notifications: new SupabaseNotificationStore(db), email: new LogEmailSender(), clock: { now: () => new Date('2026-11-02T09:00:00Z') },
    settings: { enabled: true, batchSize: 50, quietStart: '21:00', quietEnd: '08:00', timeZone: 'Asia/Dubai', dailyCap: 5, whatsappAvailable: false, business: () => loadBusinessInfo(db) },
  });

  /** Messages reference outbox rows, so they go first; other test files must not leave pending events behind. */
  const clearOutbox = async () => {
    await db.from('messages').delete().not('outbox_id', 'is', null);
    await db.from('outbox').delete().neq('id', 0);
  };

  beforeAll(async () => {
    await clearOutbox();
    for (const [label, role] of [['mop', 'operator'], ['msa', 'super_admin']] as const) {
      const { data, error } = await db.auth.admin.createUser({ email: `${label}-${stamp}@dev.test`, password: `test-${stamp}-password`, email_confirm: true });
      if (error) throw error;
      staffIds.push(data.user.id);
      await db.from('profiles').insert({ user_id: data.user.id, full_name: `Staff ${label}`, role });
    }
  });

  afterAll(async () => {
    const customers = (await db.from('customers').select('id').like('full_name', `Mail Visitor ${stamp}%`)).data?.map((c) => c.id) ?? [];
    await db.from('messages').delete().in('customer_id', customers);
    await db.from('enquiries').delete().in('customer_id', customers);
    await db.from('customers').delete().in('id', customers);
    await clearOutbox();
    for (const id of staffIds) {
      await db.from('notifications').delete().eq('user_id', id);
      await db.from('profiles').delete().eq('user_id', id);
      await db.auth.admin.deleteUser(id);
    }
    await db.from('notification_rules').update({ enabled: true }).eq('event', 'enquiry.created').eq('channel', 'email');
  });

  const submit = (name: string, email: string | undefined) =>
    new SupabaseEnquiryStore(anonClient).save({
      id: crypto.randomUUID(), source: 'contact', name, phoneE164: `+9715${String(stamp).slice(-8)}`, email, message: 'Is Max still available?',
      receivedAt: new Date(), consent: { textVersion: 'v-test', marketing: false, whatsappUpdates: false, sourcePage: '/contact' },
    });

  it('an enquiry becomes one outbox event, one acknowledgement email and in-app notifications for staff', async () => {
    await submit(`Mail Visitor ${stamp}`, `visitor-${stamp}@dev.test`);
    const pending = await db.from('outbox').select('event').eq('status', 'pending');
    expect(pending.data?.map((r) => r.event)).toEqual(['enquiry.created']);

    const first = await worker().run();
    expect(first).toMatchObject({ claimed: 1, done: 1, sent: 1 });
    const messages = await db.from('messages').select('status, provider, to_address, subject, body').eq('template_key', 'enquiry_received');
    expect(messages.data).toHaveLength(1);
    expect(messages.data?.[0]).toMatchObject({ status: 'sent', provider: 'log', to_address: `visitor-${stamp}@dev.test`, subject: 'We received your enquiry' });
    expect(messages.data?.[0]?.body).toContain(`Hi Mail,`);

    const notes = await db.from('notifications').select('user_id, title, body').in('user_id', staffIds).eq('title', 'New enquiry');
    expect(notes.data).toHaveLength(2);
    expect(notes.data?.[0]?.body).toContain(`Mail Visitor ${stamp}`);

    const second = await worker().run();
    expect(second.claimed).toBe(0);
  });

  it('an unconfigured WhatsApp rule is skipped visibly and a disabled rule sends nothing', async () => {
    await db.from('notification_rules').update({ enabled: true }).eq('event', 'enquiry.created').eq('channel', 'whatsapp');
    await db.from('notification_rules').update({ enabled: false }).eq('event', 'enquiry.created').eq('channel', 'email');
    await submit(`Mail Visitor ${stamp} B`, `visitor-b-${stamp}@dev.test`);
    expect(await worker().run()).toMatchObject({ claimed: 1, done: 1, sent: 0 });
    const skipped = await db.from('messages').select('status, error, channel').eq('channel', 'whatsapp').eq('status', 'skipped');
    expect(skipped.data?.[0]).toMatchObject({ error: 'channel unavailable' });
    await db.from('notification_rules').update({ enabled: false }).eq('event', 'enquiry.created').eq('channel', 'whatsapp');
    const emails = await db.from('messages').select('id').eq('template_key', 'enquiry_received').eq('status', 'sent');
    expect(emails.data).toHaveLength(1);
  });

  it('a failing provider retries with backoff, and the same event never double sends', async () => {
    await db.from('notification_rules').update({ enabled: true }).eq('event', 'enquiry.created').eq('channel', 'email');
    await submit(`Mail Visitor ${stamp} C`, `visitor-c-${stamp}@dev.test`);
    const failing = createOutboxWorker({
      outbox: new SupabaseOutboxStore(db), rules: new SupabaseRuleStore(db), templates: new SupabaseTemplateStore(db), context: new SupabaseContextLoader(db), staff: new SupabaseStaffDirectory(db),
      messages: new SupabaseMessageLog(db), notifications: new SupabaseNotificationStore(db), email: { id: 'broken', send: async () => { throw new Error('provider down'); } }, clock: { now: () => new Date() },
      settings: { enabled: true, batchSize: 50, quietStart: '21:00', quietEnd: '08:00', timeZone: 'Asia/Dubai', dailyCap: 5, whatsappAvailable: false, business: () => loadBusinessInfo(db) },
    });
    expect(await failing.run()).toMatchObject({ claimed: 1, retried: 1 });
    const row = await db.from('outbox').select('id, status, attempts, next_attempt_at, last_error').eq('status', 'pending').single();
    expect(row.data?.attempts).toBe(1);
    expect(new Date(row.data?.next_attempt_at ?? 0).getTime()).toBeGreaterThan(Date.now());
    expect(row.data?.last_error).toContain('provider down');
    await db.from('outbox').update({ next_attempt_at: new Date(Date.now() - 1000).toISOString() }).eq('status', 'pending');
    expect(await worker().run()).toMatchObject({ claimed: 1, sent: 1, done: 1 });
    // The three submissions share one phone number, so they share one customer (and that customer's first email).
    const sent = await db.from('messages').select('id, status').eq('outbox_id', row.data?.id ?? 0);
    expect(sent.data).toEqual([expect.objectContaining({ status: 'sent' })]);
  });
});
