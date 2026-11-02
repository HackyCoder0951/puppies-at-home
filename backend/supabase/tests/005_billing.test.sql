begin;
select no_plan();

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a8', 'sa8@dev.test'),
  ('00000000-0000-0000-0000-0000000000b8', 'op8@dev.test');
insert into public.profiles (user_id, full_name, role) values
  ('00000000-0000-0000-0000-0000000000a8', 'Super Eight', 'super_admin'),
  ('00000000-0000-0000-0000-0000000000b8', 'Operator Eight', 'operator');
insert into public.customers (id, full_name, phone_e164) values ('00000000-0000-0000-0000-00000000c008', 'Billing Customer', '+971500000808');

-- Operator creates and confirms an order of AED 4,800 (+5% VAT = AED 5,040), deposit AED 1,000
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b8","role":"authenticated"}', true);
set local role authenticated;
create temp table o on commit drop as
  select public.create_order('00000000-0000-0000-0000-00000000c008', null, 'local',
    '[{"description":"Maltipoo puppy","quantity":1,"unitMinor":450000},{"description":"Vaccination pack","quantity":2,"unitMinor":15000}]'::jsonb, 100000) as r;
grant select on o to public;
select is((select tax_minor from public.orders where id = (select (r ->> 'id')::uuid from o)), 24000::bigint, 'BIL-001 VAT is added per line and snapshotted on the order');
select is((select tax_rate_bps from public.orders where id = (select (r ->> 'id')::uuid from o)), 500, 'BIL-002 the default rate is 5%');
select throws_ok(format($$select public.record_manual_payment(%L, null, 'ref-too-early-1', 'cash', 100000)$$, (select r ->> 'id' from o)), 'P0001', 'Payments need a confirmed order', 'BIL-003 no payment on a new order');
select lives_ok(format($$select public.transition_order(%L, 'confirmed')$$, (select r ->> 'id' from o)), 'BIL-004 confirm the order');

-- Draft invoice, edit, issue
create temp table inv on commit drop as select public.create_invoice((select (r ->> 'id')::uuid from o), null, 'Thank you') as id;
grant select on inv to public;
select is((select total_minor from public.invoices where id = (select id from inv)), 504000::bigint, 'BIL-005 the draft invoice totals items plus VAT');
select is((select number from public.invoices where id = (select id from inv)), null, 'BIL-006 a draft has no number');
select lives_ok(format($$select public.update_invoice_draft(%L, current_date + 30, 'Thank you again')$$, (select id from inv)), 'BIL-007 a draft can change its due date and notes');
select throws_ok(format($$select public.set_order_items(%L, '[{"description":"Changed item","quantity":1,"unitMinor":1000}]'::jsonb)$$, (select r ->> 'id' from o)), 'P0001', null, 'BIL-008 the order items are locked while an invoice exists');
select matches((select public.issue_invoice((select id from inv))), '^INV-[0-9]{4}-[0-9]{6}$', 'BIL-009 issuing allocates the number');
select throws_ok(format($$select public.update_invoice_draft(%L, current_date, 'x')$$, (select id from inv)), 'P0001', 'Only draft invoices can be edited', 'BIL-010 an issued invoice cannot be edited');
reset role;
select throws_ok(format($$update public.invoices set total_minor = 1 where id = %L$$, (select id from inv)), 'P0001', 'An issued invoice cannot be changed', 'BIL-011 direct SQL cannot change an issued invoice either');
select throws_ok(format($$update public.invoice_lines set unit_minor = 1 where invoice_id = %L$$, (select id from inv)), 'P0001', 'Only draft invoices have editable lines', 'BIL-012 issued lines are locked');

-- Payments: idempotent, bounded, linked to the invoice
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b8","role":"authenticated"}', true);
set local role authenticated;
select is((select (public.record_manual_payment((select (r ->> 'id')::uuid from o), (select id from inv), 'cash-receipt-0001', 'cash', 100000, 'deposit') ->> 'duplicate')::boolean), false, 'BIL-013 first payment is recorded');
select is((select (public.record_manual_payment((select (r ->> 'id')::uuid from o), (select id from inv), 'cash-receipt-0001', 'cash', 100000, 'deposit') ->> 'duplicate')::boolean), true, 'BIL-014 the same reference is a duplicate');
select is((select count(*)::int from public.payments where gateway_ref = 'cash-receipt-0001'), 1, 'BIL-015 one row for a repeated reference');
select is((select paid_minor from public.orders where id = (select (r ->> 'id')::uuid from o)), 100000::bigint, 'BIL-016 the order is credited once');
select is((select status::text from public.orders where id = (select (r ->> 'id')::uuid from o)), 'deposit_paid', 'BIL-017 the deposit moves the order forward');
select is((select status::text from public.invoices where id = (select id from inv)), 'partially_paid', 'BIL-018 the invoice is partially paid');
select throws_ok(format($$select public.record_manual_payment(%L, null, 'too-much-0001', 'bank_transfer', 999999999)$$, (select r ->> 'id' from o)), 'P0001', 'The payment is more than the balance', 'BIL-019 overpayment is rejected');
select lives_ok(format($$select public.record_manual_payment(%L, %L, 'bank-transfer-0002', 'bank_transfer', 404000)$$, (select r ->> 'id' from o), (select id from inv)), 'BIL-020 the rest is paid');
select is((select status::text from public.invoices where id = (select id from inv)), 'paid', 'BIL-021 the invoice is paid');
select is((select balance_minor from public.orders where id = (select (r ->> 'id')::uuid from o)), 0::bigint, 'BIL-022 the order balance is zero');

-- Void rules and refunds
select throws_ok(format($$select public.void_invoice(%L, 'mistake')$$, (select id from inv)), '42501', null, 'BIL-023 operators cannot void');
create temp table pay on commit drop as select id from public.payments where gateway_ref = 'bank-transfer-0002';
grant select on pay to public;
create temp table rf on commit drop as select public.request_refund((select id from pay), 100000, 'returned an extra') as id;
grant select on rf to public;
select throws_ok(format($$select public.decide_refund(%L, true)$$, (select id from rf)), '42501', null, 'BIL-024 operators cannot decide refunds');
select throws_ok(format($$select public.request_refund(%L, 999999999, 'too much')$$, (select id from pay)), 'P0001', 'The refund is more than what is left of the payment', 'BIL-025 a refund cannot exceed the payment');
reset role;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a8","role":"authenticated"}', true);
set local role authenticated;
select lives_ok(format($$select public.decide_refund(%L, true, 'agreed')$$, (select id from rf)), 'BIL-026 a super admin approves a partial refund');
select is((select status::text from public.payments where id = (select id from pay)), 'partially_refunded', 'BIL-027 the payment is partially refunded');
select is((select paid_minor from public.orders where id = (select (r ->> 'id')::uuid from o)), 404000::bigint, 'BIL-028 the order paid amount drops by the refund');
select is((select status::text from public.invoices where id = (select id from inv)), 'partially_paid', 'BIL-029 the invoice falls back to partially paid');
select throws_ok(format($$select public.void_invoice(%L, 'oops')$$, (select id from inv)), 'P0001', null, 'BIL-030 an invoice with payments cannot be voided');
select throws_ok(format($$select public.decide_refund(%L, true)$$, (select id from rf)), 'P0001', 'That refund is not waiting for a decision', 'BIL-031 a decided refund cannot be decided again');

-- A second order: void an unpaid invoice, overdue job, tax rate changes
create temp table o2 on commit drop as select public.create_order('00000000-0000-0000-0000-00000000c008', null, 'local', '[{"description":"Accessory","quantity":1,"unitMinor":10000}]'::jsonb) as r;
grant select on o2 to public;
create temp table inv2 on commit drop as select public.create_invoice((select (r ->> 'id')::uuid from o2), current_date - 3) as id;
grant select on inv2 to public;
select lives_ok(format($$select public.issue_invoice(%L, current_date + 1)$$, (select id from inv2)), 'BIL-032 issue an invoice');
reset role;
update public.invoices set due_at = current_date - 2 where id = (select id from inv2);
select is((select public.mark_overdue_invoices()), 1, 'BIL-033 the daily job marks past-due invoices overdue');
select is((select status::text from public.invoices where id = (select id from inv2)), 'overdue', 'BIL-034 the invoice is overdue');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a8","role":"authenticated"}', true);
set local role authenticated;
select lives_ok(format($$select public.void_invoice(%L, 'issued in error')$$, (select id from inv2)), 'BIL-035 a super admin voids an unpaid invoice');
select is((select status::text from public.invoices where id = (select id from inv2)), 'void', 'BIL-036 it is void');
select lives_ok($$select public.set_default_tax_rate('Test VAT 10%', 1000)$$, 'BIL-037 a super admin changes the default rate');
select is((select tax_rate_bps from public.orders where id = (select (r ->> 'id')::uuid from o)), 500, 'BIL-038 existing orders keep their snapshot');
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b8","role":"authenticated"}', true);
set local role authenticated;
select throws_ok($$select public.set_default_tax_rate('Cheap', 0)$$, '42501', null, 'BIL-039 operators cannot change the rate');
select throws_ok($$select public.mark_overdue_invoices()$$, '42501', null, 'BIL-040 operators cannot run the overdue job');
reset role;
set local role anon;
select throws_ok($$select count(*) from public.payments$$, '42501', null, 'BIL-041 anon cannot read payments');
reset role;

select * from finish();
rollback;
