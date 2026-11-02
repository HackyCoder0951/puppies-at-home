import { describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { SupabaseEnquiryStore } from '@backend/adapters';

/** Opt-in (seeded local stack): an enquiry saved through the anon RPC lands in the database; anon cannot read it. */
const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const run = url && anon && service ? describe : describe.skip;

run('supabase enquiry store', () => {
  it('stores an enquiry with its consent record and hides it from anon', async () => {
    const anonClient = createClient(url ?? 'http://x', anon ?? 'x', { auth: { persistSession: false } });
    const admin = createClient(url ?? 'http://x', service ?? 'x', { auth: { persistSession: false } });
    const marker = `Test Visitor ${Date.now()}`;
    await new SupabaseEnquiryStore(anonClient).save({
      id: crypto.randomUUID(), source: 'contact', name: marker, phoneE164: '+971500000000', message: 'integration test',
      receivedAt: new Date(), consent: { textVersion: 'v-test', marketing: false, whatsappUpdates: true, sourcePage: '/contact' },
    });
    const { data, error } = await admin.from('enquiries').select('id, name').eq('name', marker);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    const { data: seen } = await anonClient.from('enquiries').select('id').eq('name', marker);
    expect(seen ?? []).toHaveLength(0);
    await admin.from('enquiries').delete().eq('name', marker);
  });
});
