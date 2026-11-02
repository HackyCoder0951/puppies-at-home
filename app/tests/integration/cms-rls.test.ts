import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createCms } from '@backend/modules/cms/application';
import { SupabaseCmsRepository, SupabaseMediaStore } from '@backend/modules/cms/infrastructure';

/**
 * Opt-in (seeded local stack): the content management module against the real database as an operator and a super
 * admin. Authorisation lives in RLS and triggers, so this is where "operators cannot delete or change settings" is proven.
 */
const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const run = url && anon && service ? describe : describe.skip;

const stamp = Date.now();
const PASSWORD = `test-${stamp}-password`;
const accounts = { operator: `op-${stamp}@dev.test`, admin: `sa-${stamp}@dev.test` };
const base = `${url}/storage/v1/object/public/site-media`;

run('cms against RLS', () => {
  const admin = createClient(url ?? 'http://x', service ?? 'x', { auth: { persistSession: false } });
  const userIds: string[] = [];
  const created: string[] = [];
  let operator: ReturnType<typeof make>;
  let superAdmin: ReturnType<typeof make>;

  const make = (client: SupabaseClient) =>
    createCms({
      repo: new SupabaseCmsRepository(client, base),
      media: new SupabaseMediaStore(client),
      probe: { dimensions: async () => ({ width: 10, height: 10 }) },
      publisher: { changed: async () => undefined },
      ids: { next: () => crypto.randomUUID() },
    });

  async function staff(email: string, role: 'operator' | 'super_admin') {
    const { data, error } = await admin.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true });
    if (error) throw error;
    userIds.push(data.user.id);
    await admin.from('profiles').insert({ user_id: data.user.id, full_name: `Test ${role}`, role });
    const client = createClient(url ?? '', anon ?? '', { auth: { persistSession: false } });
    const { error: signIn } = await client.auth.signInWithPassword({ email, password: PASSWORD });
    if (signIn) throw signIn;
    return make(client);
  }

  beforeAll(async () => {
    operator = await staff(accounts.operator, 'operator');
    superAdmin = await staff(accounts.admin, 'super_admin');
  });

  afterAll(async () => {
    for (const id of created) await admin.from('puppies').delete().eq('id', id);
    for (const id of userIds) {
      await admin.from('profiles').delete().eq('user_id', id);
      await admin.auth.admin.deleteUser(id);
    }
  });

  it('operator creates, edits and publishes a puppy; it appears in the public view only once published', async () => {
    const r = await operator.createPuppy({ name: `Rio${stamp}`, breed: 'Maltipoo', sex: 'male', ageText: '2 months', origin: 'local', priceAed: '4500' });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    created.push(r.value.id);
    const publicClient = createClient(url ?? '', anon ?? '', { auth: { persistSession: false } });
    const slug = (await operator.getPuppy(r.value.id)) as { ok: true; value: { slug: string } };
    expect((await publicClient.from('v_public_puppies').select('slug').eq('slug', slug.value.slug)).data).toHaveLength(0);

    expect((await operator.updatePuppy(r.value.id, { name: `Rio${stamp}`, breed: 'Maltipoo', sex: 'male', ageText: '3 months', origin: 'local' })).ok).toBe(true);
    expect((await operator.publishPuppy(r.value.id, true)).ok).toBe(true);
    const visible = await publicClient.from('v_public_puppies').select('slug, age_text').eq('slug', slug.value.slug);
    expect(visible.data).toEqual([{ slug: slug.value.slug, age_text: '3 months' }]);
    expect(JSON.stringify(visible.data)).not.toMatch(/price/i);
  });

  it('operator cannot delete a puppy or change settings; super admin can', async () => {
    const r = await operator.createPuppy({ breed: 'Pomeranian', sex: 'female', ageText: '4 months', origin: 'imported' });
    if (!r.ok) throw new Error('create failed');
    created.push(r.value.id);
    expect(await operator.deletePuppy(r.value.id)).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect((await superAdmin.deletePuppy(r.value.id)).ok).toBe(true);

    const settings = { whatsapp_number: '971541676733', whatsapp_text: 'Hi TeddyPups! I\'d love to know more about your puppies.', phone_href: 'tel:+971541676733', email: 'teddypupsadmin@gmail.com', address: 'Downtown Dubai, United Arab Emirates', maps_href: 'https://maps.app.goo.gl/ZdJvwHBSQWWZT54s7', instagram: 'https://www.instagram.com/teddypups.worldwide/', tiktok: 'https://www.tiktok.com/@teddypupsuae', facebook: 'https://www.facebook.com/profile.php?id=61567496944539' };
    expect(await operator.saveSettings(settings)).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect((await superAdmin.saveSettings(settings)).ok).toBe(true);
  });

  it('stores an uploaded photo for the puppy and removes its row and file', async () => {
    const r = await operator.createPuppy({ breed: 'Shih Tzu', sex: 'female', ageText: '2 months', origin: 'local' });
    if (!r.ok) throw new Error('create failed');
    created.push(r.value.id);
    const png = new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'));
    expect((await operator.addPuppyMedia(r.value.id, { bytes: png, contentType: 'image/png', alt: 'A test photo' })).ok).toBe(true);
    const detail = await operator.getPuppy(r.value.id);
    if (!detail.ok) throw new Error('read failed');
    expect(detail.value.media).toHaveLength(1);
    expect(detail.value.media[0]?.isCover).toBe(true);
    const head = await fetch(detail.value.media[0]?.url ?? '');
    expect(head.status).toBe(200);
    expect((await operator.removePuppyMedia(detail.value.media[0]?.id ?? '')).ok).toBe(true);
  });
});
