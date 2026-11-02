import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { createPrivacy } from '@backend/modules/privacy/application';
import { SupabasePrivacyRepository } from '@backend/modules/privacy/infrastructure';

/** Opt-in (seeded local stack): request, export, restriction and erasure through the module with real roles. */
const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const run = url && anon && service ? describe : describe.skip;
const stamp = Date.now();

run('privacy against the database', () => {
  const db = createClient(url ?? 'http://x', service ?? 'x', { auth: { persistSession: false } });
  const users: string[] = [];
  let op: ReturnType<typeof createPrivacy>;
  let sa: ReturnType<typeof createPrivacy>;
  let customerId = '';
  const name = `Erase Me ${stamp}`;

  async function staff(label: string, role: 'operator' | 'super_admin') {
    const email = `${label}-${stamp}@dev.test`;
    const { data, error } = await db.auth.admin.createUser({ email, password: `test-${stamp}-password`, email_confirm: true });
    if (error) throw error;
    users.push(data.user.id);
    await db.from('profiles').insert({ user_id: data.user.id, full_name: `Staff ${label}`, role });
    const client = createClient(url ?? '', anon ?? '', { auth: { persistSession: false } });
    await client.auth.signInWithPassword({ email, password: `test-${stamp}-password` });
    return createPrivacy(new SupabasePrivacyRepository(client));
  }

  beforeAll(async () => {
    op = await staff('pop', 'operator');
    sa = await staff('psa', 'super_admin');
    customerId = (await db.from('customers').insert({ full_name: name, phone_e164: '+971500000707', email: `erase-${stamp}@dev.test` }).select('id').single()).data?.id as string;
    await db.from('enquiries').insert({ customer_id: customerId, source: 'manual', name, phone: '+971500000707', message: 'private words' });
  });

  afterAll(async () => {
    await db.from('dsr_requests').delete().like('requester_name', `Erase Me ${stamp}%`);
    await db.from('enquiries').delete().eq('customer_id', customerId);
    await db.from('customers').delete().eq('id', customerId);
    for (const id of users) { await db.from('notifications').delete().eq('user_id', id); await db.from('profiles').delete().eq('user_id', id); await db.auth.admin.deleteUser(id); }
  });

  it('operators log requests but cannot export, restrict or erase; a super admin can', async () => {
    const logged = await op.createRequest({ type: 'erasure', requester: name, contact: 'erase@dev.test', details: 'please delete', customerId });
    expect(logged.ok).toBe(true);
    expect(await op.exportSubject(customerId, null)).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect(await op.restrict(customerId, true)).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect(await op.anonymiseSubject(customerId, null, name)).toEqual({ ok: false, error: { code: 'forbidden' } });

    const exported = await sa.exportSubject(customerId, null);
    expect(exported.ok && JSON.stringify(exported.value)).toContain('private words');
    expect((await sa.restrict(customerId, true)).ok).toBe(true);
    expect(await sa.anonymiseSubject(customerId, null, 'wrong name')).toMatchObject({ ok: false, error: { code: 'rule' } });
    expect((await sa.anonymiseSubject(customerId, logged.ok ? logged.value : null, name)).ok).toBe(true);
    const row = await db.from('customers').select('full_name, email').eq('id', customerId).single();
    expect(row.data).toEqual({ full_name: 'Anonymised customer', email: null });
    expect((await db.from('enquiries').select('message').eq('customer_id', customerId).single()).data?.message).toBeNull();
    expect(await sa.anonymiseSubject(customerId, null, 'Anonymised customer')).toMatchObject({ ok: false });
  });
});
