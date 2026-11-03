import { describe, expect, it } from 'vitest';
import { isQuietHour, renderTemplate, textToHtml, type CustomerInfo, type EventContext, type MessageRecord, type OutboxEvent, type Rule, type Template } from '../domain';
import { createOutboxWorker, type WorkerDeps } from './worker';

const customer = (over: Partial<CustomerInfo> = {}): CustomerInfo => ({ id: 'c1', fullName: 'Aisha Khan', email: 'aisha@dev.test', phone: '+971500000001', emailAllowed: true, whatsappAllowed: true, whatsappOptedIn: true, ...over });
const event = (over: Partial<OutboxEvent> = {}): OutboxEvent => ({ id: 1, event: 'order.confirmed', entity: 'order', entityId: 'o1', payload: { orderId: 'o1', customerId: 'c1' }, attempts: 1, ...over });
const emailRule = (over: Partial<Rule> = {}): Rule => ({ id: 'r1', event: 'order.confirmed', channel: 'email', templateKey: 'order_confirmed', recipientType: 'customer', recipientRef: null, respectQuietHours: false, inAppTitle: null, inAppBody: null, ...over });
const template: Template = { key: 'order_confirmed', channel: 'email', subject: 'Order {{order.number}}', body: 'Hi {{customer.first_name}}, order {{order.number}} is confirmed.\n\n{{business.name}}', version: 1 };

function setup(opts: { events?: OutboxEvent[]; rules?: Rule[]; context?: EventContext; sendFails?: boolean; sentToday?: number; now?: Date; staff?: { userId: string; role: 'super_admin' | 'operator' }[]; attach?: { filename: string; content: Uint8Array; contentType: string }[]; whatsapp?: boolean } = {}) {
  const log = new Map<string, MessageRecord>();
  const sent: { to: string; subject: string; html: string; attachments?: readonly { filename: string }[] }[] = [];
  const notes: { userId: string; title: string }[] = [];
  const waSent: { to: string; templateName: string; params: readonly string[] }[] = [];
  const outbox = { completed: [] as number[], failed: [] as number[], deferred: [] as number[] };
  const pending = [...(opts.events ?? [event()])];
  const deps: WorkerDeps = {
    outbox: {
      claim: async () => pending.splice(0),
      complete: async (id) => void outbox.completed.push(id),
      fail: async (id) => (outbox.failed.push(id), 'retry'),
      defer: async (id) => void outbox.deferred.push(id),
    },
    rules: { enabledFor: async (name) => (opts.rules ?? [emailRule()]).filter((r) => r.event === name) },
    templates: { active: async (key, channel) => (key === template.key && channel === 'email' ? template : key === 'order_confirmed_wa' && channel === 'whatsapp' ? { key, channel, subject: null, body: 'Hi {{customer.first_name}}, order {{order.number}} is confirmed.', version: 1 } : null) },
    context: { load: async () => opts.context ?? { customer: customer(), vars: { 'customer.name': 'Aisha Khan', 'customer.first_name': 'Aisha', 'order.number': 'TP-1' } } },
    staff: { recipients: async () => opts.staff ?? [{ userId: 'u1', role: 'operator' }, { userId: 'u2', role: 'super_admin' }], byId: async (id) => (opts.staff ?? [{ userId: 'u1', role: 'operator' as const }]).find((s) => s.userId === id) ?? null, emailOf: async (id) => `${id}@staff.test` },
    messages: {
      create: async (m) => (log.has(m.idempotencyKey) ? false : (log.set(m.idempotencyKey, m), true)),
      update: async (key, patch) => void log.set(key, { ...(log.get(key) as MessageRecord), ...patch }),
      status: async (key) => log.get(key)?.status ?? null,
      sentToday: async () => opts.sentToday ?? 0,
    },
    notifications: { create: async (n) => void notes.push({ userId: n.userId, title: n.title }) },
    email: { id: 'test', send: async (m) => { if (opts.sendFails) throw new Error('provider down'); sent.push(m); return { providerId: 'p1' }; } },
    ...(opts.whatsapp ? { whatsapp: { id: 'wa-test', send: async (m: { to: string; templateName: string; params: readonly string[] }) => (waSent.push(m), { providerId: 'wamid.T1' }) } } : {}),
    ...(opts.attach ? { attachments: { forEvent: async (e: OutboxEvent) => (e.event === 'order.confirmed' ? opts.attach ?? [] : []) } } : {}),
    clock: { now: () => opts.now ?? new Date('2026-11-02T09:00:00Z') },
    settings: { enabled: true, batchSize: 20, quietStart: '21:00', quietEnd: '08:00', timeZone: 'Asia/Dubai', dailyCap: 5, whatsappAvailable: Boolean(opts.whatsapp), business: async () => ({ name: 'TeddyPups U.A.E.', phone: '+971 54 167 6733', whatsappUrl: 'https://wa.me/971541676733' }) },
  };
  return { worker: createOutboxWorker(deps), log, sent, waSent, notes, outbox, requeue: (e: OutboxEvent) => void pending.push(e) };
}

describe('outbox worker', () => {
  it('renders the active template, sends once and records the message', async () => {
    const t = setup();
    const summary = await t.worker.run();
    expect(summary).toMatchObject({ claimed: 1, done: 1, sent: 1 });
    expect(t.sent[0]).toMatchObject({ to: 'aisha@dev.test', subject: 'Order TP-1' });
    expect(t.sent[0]?.html).toContain('<p>Hi Aisha, order TP-1 is confirmed.</p>');
    expect([...t.log.values()][0]).toMatchObject({ status: 'sent', providerId: 'p1', channel: 'email' });
  });

  it('emails every staff member for a staff email rule, once, and logs each message', async () => {
    const digestRule = emailRule({ id: 'rd', event: 'staff.digest', templateKey: 'order_confirmed', recipientType: 'staff_role', recipientRef: 'any' });
    const t = setup({ events: [event({ event: 'staff.digest', entity: 'digest', payload: {} })], rules: [digestRule], context: { vars: { 'order.number': 'TP-9' } } });
    const summary = await t.worker.run();
    expect(summary).toMatchObject({ done: 1, sent: 1 });
    expect(t.sent.map((m) => m.to)).toEqual(['u1@staff.test', 'u2@staff.test']);
    t.requeue(event({ event: 'staff.digest', entity: 'digest', payload: {} }));
    await t.worker.run();
    expect(t.sent).toHaveLength(2);
    expect([...t.log.values()].every((m) => m.customerId === null && m.status === 'sent')).toBe(true);
  });

  it('sends a WhatsApp template by position when the provider is on and the customer opted in, and skips otherwise', async () => {
    const waRule = emailRule({ id: 'rw', channel: 'whatsapp', templateKey: 'order_confirmed_wa' });
    const on = setup({ rules: [waRule], whatsapp: true });
    await on.worker.run();
    expect(on.waSent).toEqual([{ to: '+971500000001', templateName: 'order_confirmed_wa', language: 'en', params: ['Aisha', 'TP-1'] }]);
    expect([...on.log.values()][0]).toMatchObject({ channel: 'whatsapp', provider: 'wa-test', status: 'sent', providerId: 'wamid.T1' });
    const off = setup({ rules: [waRule] });
    await off.worker.run();
    expect(off.waSent).toEqual([]);
    expect([...off.log.values()][0]).toMatchObject({ status: 'skipped', error: 'channel unavailable' });
    const noConsent = setup({ rules: [waRule], whatsapp: true, context: { customer: customer({ whatsappOptedIn: false }), vars: {} } });
    await noConsent.worker.run();
    expect([...noConsent.log.values()][0]).toMatchObject({ status: 'skipped', error: 'no WhatsApp consent' });
  });

  it('passes provider attachments to the email and sends none when there are none', async () => {
    const withFile = setup({ attach: [{ filename: 'INV-1.pdf', content: new Uint8Array([37, 80]), contentType: 'application/pdf' }] });
    await withFile.worker.run();
    expect(withFile.sent[0]?.attachments?.map((a) => a.filename)).toEqual(['INV-1.pdf']);
    const without = setup();
    await without.worker.run();
    expect(without.sent[0]?.attachments).toBeUndefined();
  });

  it('does not send twice when the same event is handled again (idempotent)', async () => {
    const t = setup();
    await t.worker.run();
    t.requeue(event());
    const second = await t.worker.run();
    expect(second.sent).toBe(1);
    expect(t.sent).toHaveLength(1);
    expect(t.log.size).toBe(1);
  });

  it('skips with a visible reason when the customer has no consent or channel (T-NOT-03)', async () => {
    const off = setup({ context: { customer: customer({ emailAllowed: false }), vars: {} } });
    expect(await off.worker.run()).toMatchObject({ skipped: 1, sent: 0, done: 1 });
    expect([...off.log.values()][0]).toMatchObject({ status: 'skipped', error: 'customer turned email off' });
    const wa = setup({ rules: [emailRule({ channel: 'whatsapp', templateKey: 'x' })] });
    await wa.worker.run();
    expect([...wa.log.values()][0]).toMatchObject({ status: 'skipped', error: 'channel unavailable' });
    const restricted = setup({ context: { customer: customer({ restricted: true }), vars: {} } });
    await restricted.worker.run();
    expect([...restricted.log.values()][0]).toMatchObject({ status: 'skipped', error: 'processing restricted' });
    expect(restricted.sent).toHaveLength(0);
    const cap = setup({ sentToday: 5 });
    await cap.worker.run();
    expect([...cap.log.values()][0]).toMatchObject({ status: 'skipped', error: 'daily cap reached' });
    expect(cap.sent).toHaveLength(0);
  });

  it('defers rules that respect quiet hours and sends the others', async () => {
    const night = new Date('2026-11-02T19:00:00Z');      // 23:00 in Dubai
    const quiet = setup({ rules: [emailRule({ respectQuietHours: true })], now: night });
    expect(await quiet.worker.run()).toMatchObject({ deferred: 1, done: 0 });
    expect(quiet.outbox.deferred).toEqual([1]);
    const transactional = setup({ now: night });
    expect(await transactional.worker.run()).toMatchObject({ sent: 1 });
  });

  it('records a failed attempt and asks the store to retry (T-NOT-02)', async () => {
    const t = setup({ sendFails: true });
    expect(await t.worker.run()).toMatchObject({ retried: 1, done: 0 });
    expect(t.outbox.failed).toEqual([1]);
    expect([...t.log.values()][0]).toMatchObject({ status: 'failed' });
  });

  it('notifies only the assignee for assignment events (T-NOT-04)', async () => {
    const rule: Rule = { id: 'r2', event: 'enquiry.assigned', channel: 'in_app', templateKey: null, recipientType: 'assignee', recipientRef: null, respectQuietHours: false, inAppTitle: 'Enquiry assigned to you', inAppBody: null };
    const t = setup({ events: [event({ event: 'enquiry.assigned' })], rules: [rule], context: { vars: {}, assigneeId: 'u1' } });
    expect(await t.worker.run()).toMatchObject({ notified: 1 });
    expect(t.notes).toEqual([{ userId: 'u1', title: 'Enquiry assigned to you' }]);
  });

  it('creates nothing when no rule is enabled for the event (T-NOT-05)', async () => {
    const t = setup({ rules: [] });
    expect(await t.worker.run()).toMatchObject({ done: 1, sent: 0, notified: 0 });
    expect(t.log.size).toBe(0);
  });

  it('sends a manual message through the same pipeline and ignores the daily cap for staff-initiated sends', async () => {
    const manual = event({ event: 'manual.message', payload: { customerId: 'c1', templateKey: 'order_confirmed', channel: 'email', sentBy: 'u1' } });
    const t = setup({ events: [manual], rules: [], sentToday: 9 });
    expect(await t.worker.run()).toMatchObject({ sent: 1 });
    expect([...t.log.values()][0]).toMatchObject({ sentBy: 'u1', status: 'sent' });
  });
});

describe('rendering helpers', () => {
  it('substitutes variables, blanks unknown ones and escapes HTML', () => {
    expect(renderTemplate('Hi {{ customer.first_name }} {{nope}}!', { 'customer.first_name': 'Aisha' })).toBe('Hi Aisha !');
    expect(textToHtml('a < b\n\nsecond & third')).toBe('<p>a &lt; b</p><p>second &amp; third</p>');
  });
  it('knows the quiet window across midnight', () => {
    expect(isQuietHour(new Date('2026-11-02T19:00:00Z'), '21:00', '08:00', 'Asia/Dubai')).toBe(true);
    expect(isQuietHour(new Date('2026-11-02T09:00:00Z'), '21:00', '08:00', 'Asia/Dubai')).toBe(false);
    expect(isQuietHour(new Date('2026-11-02T03:00:00Z'), '21:00', '08:00', 'Asia/Dubai')).toBe(true);
  });
});
