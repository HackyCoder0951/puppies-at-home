import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { createInbox } from '@backend/modules/inbox/application';
import { SupabaseInboxRepository } from '@backend/modules/inbox/infrastructure';
import { SupabaseEnquiryStore } from '@backend/adapters';

/** Opt-in (seeded local stack): public enquiry in, staff triage out, with roles enforced by the database. */
const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const run = url && anon && service ? describe : describe.skip;

const stamp = Date.now();
const PASSWORD = `test-${stamp}-password`;

run('inbox against RLS', () => {
  const admin = createClient(url ?? 'http://x', service ?? 'x', { auth: { persistSession: false } });
  const anonClient = createClient(url ?? 'http://x', anon ?? 'x', { auth: { persistSession: false } });
  const users: string[] = [];
  let inbox: ReturnType<typeof createInbox>;
  let colleague = '';
  let enquiryId = '';
  const visitor = `Visitor ${stamp}`;

  async function staff(label: string) {
    const email = `${label}-${stamp}@dev.test`;
    const { data, error } = await admin.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true });
    if (error) throw error;
    users.push(data.user.id);
    await admin.from('profiles').insert({ user_id: data.user.id, full_name: `Staff ${label}`, role: 'operator' });
    const client = createClient(url ?? '', anon ?? '', { auth: { persistSession: false } });
    const { error: signIn } = await client.auth.signInWithPassword({ email, password: PASSWORD });
    if (signIn) throw signIn;
    return { id: data.user.id, client };
  }

  beforeAll(async () => {
    const a = await staff('a');
    const b = await staff('b');
    colleague = b.id;
    inbox = createInbox(new SupabaseInboxRepository(a.client));
    await new SupabaseEnquiryStore(anonClient).save({
      id: crypto.randomUUID(), source: 'puppy', name: visitor, phoneE164: '+971500000001', email: `v${stamp}@dev.test`, puppy: 'maltipoo-max-male', message: 'Is Max still available?',
      receivedAt: new Date(), consent: { textVersion: 'v-test', marketing: false, whatsappUpdates: true, sourcePage: '/puppies/maltipoo-max-male' },
    });
  });

  afterAll(async () => {
    await admin.from('enquiries').delete().eq('name', visitor);
    await admin.from('customers').delete().eq('full_name', visitor);
    for (const id of users) {
      await admin.from('profiles').delete().eq('user_id', id);
      await admin.auth.admin.deleteUser(id);
    }
  });

  it('staff find the new enquiry with its puppy, linked customer and WhatsApp opt-in', async () => {
    const list = await inbox.listEnquiries({ search: visitor, page: 1 });
    expect(list.ok && list.value.total).toBe(1);
    if (!list.ok) return;
    const row = list.value.rows[0];
    enquiryId = row?.id ?? '';
    expect(row).toMatchObject({ status: 'new', source: 'puppy_enquiry', puppyLabel: 'Max (Maltipoo)', assignedTo: null });
    const detail = await inbox.getEnquiry(enquiryId);
    expect(detail.ok && detail.value.customerId).toBeTruthy();
    if (!detail.ok || !detail.value.customerId) return;
    const customer = await inbox.getCustomer(detail.value.customerId);
    expect(customer.ok && customer.value.whatsappOptInAt).toBeTruthy();
    expect(customer.ok && customer.value.enquiries).toHaveLength(1);
  });

  it('staff change status, assign to a colleague and add a note authored by themselves', async () => {
    expect((await inbox.setStatus(enquiryId, 'contacted')).ok).toBe(true);
    expect((await inbox.assign(enquiryId, colleague)).ok).toBe(true);
    expect((await inbox.addNote(enquiryId, 'Called, will visit Saturday.')).ok).toBe(true);
    const detail = await inbox.getEnquiry(enquiryId);
    if (!detail.ok) throw new Error('read failed');
    expect(detail.value).toMatchObject({ status: 'contacted', assignedTo: colleague });
    expect(detail.value.notes.map((n) => [n.body, n.authorName])).toEqual([['Called, will visit Saturday.', 'Staff a']]);
    const staffList = await inbox.listStaff();
    expect(staffList.ok && staffList.value.some((s) => s.userId === colleague)).toBe(true);
  });

  it('anonymous visitors cannot read enquiries or customers', async () => {
    expect((await anonClient.from('enquiries').select('id')).data ?? []).toHaveLength(0);
    expect((await anonClient.from('customers').select('id')).data ?? []).toHaveLength(0);
    expect((await anonClient.rpc('list_staff')).error).not.toBeNull();
  });
});
