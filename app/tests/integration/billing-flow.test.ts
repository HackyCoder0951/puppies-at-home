import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { createBilling } from '@backend/modules/billing/application';
import { SupabaseBillingRepository, loadInvoiceDocument, renderInvoicePdf } from '@backend/modules/billing/infrastructure';
import { createCommerce } from '@backend/modules/commerce/application';
import { SupabaseCommerceRepository } from '@backend/modules/commerce/infrastructure';

/** Opt-in (seeded local stack): enquiry-to-cash through the real database, as operator and super admin (AC-016, AC-017). */
const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const run = url && anon && service ? describe : describe.skip;

const stamp = Date.now();
const PASSWORD = `test-${stamp}-password`;

run('billing against the database', () => {
  const admin = createClient(url ?? 'http://x', service ?? 'x', { auth: { persistSession: false } });
  const users: string[] = [];
  let op: { billing: ReturnType<typeof createBilling>; commerce: ReturnType<typeof createCommerce> };
  let sa: { billing: ReturnType<typeof createBilling>; commerce: ReturnType<typeof createCommerce> };
  let customerId = '';
  let orderId = '';
  let invoiceId = '';
  let paymentId = '';

  async function staff(label: string, role: 'operator' | 'super_admin') {
    const email = `${label}-${stamp}@dev.test`;
    const { data, error } = await admin.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true });
    if (error) throw error;
    users.push(data.user.id);
    await admin.from('profiles').insert({ user_id: data.user.id, full_name: `Staff ${label}`, role });
    const client = createClient(url ?? '', anon ?? '', { auth: { persistSession: false } });
    const { error: signIn } = await client.auth.signInWithPassword({ email, password: PASSWORD });
    if (signIn) throw signIn;
    return { billing: createBilling(new SupabaseBillingRepository(client)), commerce: createCommerce(new SupabaseCommerceRepository(client)) };
  }

  beforeAll(async () => {
    op = await staff('bop', 'operator');
    sa = await staff('bsa', 'super_admin');
    const customer = await admin.from('customers').insert({ full_name: `Billing Customer ${stamp}`, phone_e164: '+971500000888' }).select('id').single();
    customerId = customer.data?.id as string;
  });

  afterAll(async () => {
    if (orderId) {
      await admin.from('refunds').delete().in('payment_id', (await admin.from('payments').select('id').eq('order_id', orderId)).data?.map((p) => p.id) ?? []);
      await admin.from('payments').delete().eq('order_id', orderId);
      await admin.from('invoice_lines').delete().in('invoice_id', (await admin.from('invoices').select('id').eq('order_id', orderId)).data?.map((i) => i.id) ?? []);
      await admin.from('invoices').delete().eq('order_id', orderId);
      await admin.from('orders').delete().eq('id', orderId);
    }
    await admin.from('customers').delete().eq('id', customerId);
    for (const id of users) {
      await admin.from('profiles').delete().eq('user_id', id);
      await admin.auth.admin.deleteUser(id);
    }
  });

  it('order with VAT, invoice issued and locked, payments idempotent, invoice paid', async () => {
    const created = await op.commerce.createOrder({ customerId, type: 'local', depositMinor: '1000', items: [{ description: 'Accessory bundle', quantity: 2, unitMinor: '1000' }] });
    if (!created.ok) throw new Error('order failed');
    orderId = created.value.id;
    const confirmed = await op.commerce.transitionOrder(orderId, 'confirmed', '');
    expect(confirmed.ok).toBe(true);
    const detail = await op.commerce.getOrder(orderId);
    expect(detail.ok && [detail.value.totalMinor, detail.value.balanceMinor]).toEqual([200000, 210000]);

    const invoice = await op.billing.createInvoice(orderId, '', 'Thank you');
    if (!invoice.ok) throw new Error('invoice failed');
    invoiceId = invoice.value;
    const issued = await op.billing.issueInvoice(invoiceId, '');
    expect(issued.ok && issued.value).toMatch(/^INV-\d{4}-\d{6}$/);
    const doc = await loadInvoiceDocument(admin, invoiceId);
    expect(doc).toMatchObject({ number: issued.ok ? issued.value : '', currency: 'AED' });
    expect(doc?.lines.length).toBeGreaterThan(0);
    expect(doc?.business.address).not.toBe('');
    expect(Buffer.from(await renderInvoicePdf(doc!)).subarray(0, 5).toString()).toBe('%PDF-');
    const edit = await op.billing.updateDraft(invoiceId, '', 'changed');
    expect(edit).toMatchObject({ ok: false, error: { code: 'rule' } });

    const ref = { orderId, invoiceId, method: 'bank_transfer', reference: `bank-${stamp}-001`, amountMinor: '1000' };
    const first = await op.billing.recordPayment(ref);
    const again = await op.billing.recordPayment(ref);
    expect(first.ok && first.value.duplicate).toBe(false);
    expect(again.ok && again.value).toEqual({ id: first.ok ? first.value.id : '', duplicate: true });
    paymentId = first.ok ? first.value.id : '';

    expect((await op.commerce.getOrder(orderId)).ok).toBe(true);
    const after = await op.commerce.getOrder(orderId);
    expect(after.ok && [after.value.status, after.value.paidMinor, after.value.balanceMinor]).toEqual(['deposit_paid', 100000, 110000]);
    expect(await op.billing.recordPayment({ ...ref, reference: `bank-${stamp}-002`, amountMinor: '5000' })).toMatchObject({ ok: false, error: { code: 'rule', message: 'The payment is more than the balance' } });

    expect((await op.billing.recordPayment({ ...ref, reference: `bank-${stamp}-003`, amountMinor: '1100' })).ok).toBe(true);
    const full = await op.billing.getInvoice(invoiceId);
    expect(full.ok && [full.value.status, full.value.totalMinor, full.value.taxMinor, full.value.paidMinor]).toEqual(['paid', 210000, 10000, 210000]);
    expect(full.ok && full.value.payments).toHaveLength(2);
  });

  it('operators request refunds, only a super admin decides, balances follow', async () => {
    const request = await op.billing.requestRefund({ paymentId, amountMinor: '300', reason: 'Item returned' });
    expect(request.ok).toBe(true);
    if (!request.ok) return;
    expect(await op.billing.decideRefund(request.value, true, '')).toEqual({ ok: false, error: { code: 'forbidden' } });
    const pending = await sa.billing.pendingRefunds();
    expect(pending.ok && pending.value.some((p) => p.refundId === request.value)).toBe(true);
    expect((await sa.billing.decideRefund(request.value, true, 'agreed')).ok).toBe(true);
    const order = await op.commerce.getOrder(orderId);
    expect(order.ok && order.value.paidMinor).toBe(180000);
    const invoice = await op.billing.getInvoice(invoiceId);
    expect(invoice.ok && invoice.value.status).toBe('partially_paid');
    expect(await op.billing.voidInvoice(invoiceId, 'mistake')).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect(await sa.billing.voidInvoice(invoiceId, 'mistake')).toMatchObject({ ok: false, error: { code: 'rule' } });
  });

  it('only a super admin changes the VAT rate, and existing orders keep theirs', async () => {
    expect(await op.billing.setDefaultTaxRate({ name: 'Cheap', percent: '0' })).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect((await sa.billing.setDefaultTaxRate({ name: 'UAE VAT 5%', percent: '5' })).ok).toBe(true);
    const rates = await sa.billing.taxRates();
    expect(rates.ok && rates.value.filter((r) => r.isDefault)).toHaveLength(1);
    const order = await op.commerce.getOrder(orderId);
    expect(order.ok && order.value.totalMinor).toBe(200000);
  });
});
