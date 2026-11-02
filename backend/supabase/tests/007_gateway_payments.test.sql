begin;
select no_plan();

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a5', 'sa5@dev.test'),
  ('00000000-0000-0000-0000-0000000000b5', 'op5@dev.test');
insert into public.profiles (user_id, full_name, role) values
  ('00000000-0000-0000-0000-0000000000a5', 'Super Five', 'super_admin'),
  ('00000000-0000-0000-0000-0000000000b5', 'Operator Five', 'operator');
insert into public.customers (id, full_name, phone_e164) values ('00000000-0000-0000-0000-00000000c005', 'Gateway Customer', '+971500000505');

-- Start from an empty outbox (inside this rolled-back transaction; other suites may leave events behind)
delete from public.messages;
delete from public.outbox;

-- A confirmed AED 1,000 (+5% = 1,050) order with an issued invoice
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b5","role":"authenticated"}', true);
set local role authenticated;
create temp table o on commit drop as select public.create_order('00000000-0000-0000-0000-00000000c005', null, 'local', '[{"description":"Item","quantity":1,"unitMinor":100000}]'::jsonb) as r;
grant select on o to public;
select public.transition_order((select (r ->> 'id')::uuid from o), 'confirmed');
create temp table inv on commit drop as select public.create_invoice((select (r ->> 'id')::uuid from o)) as id;
grant select on inv to public;
select public.issue_invoice((select id from inv));

-- Staff start a hosted payment: pending, idempotent on the gateway reference
create temp table g1 on commit drop as select public.start_gateway_payment((select (r ->> 'id')::uuid from o), (select id from inv), 'stripe', 'cs_test_00000001', 105000, 'https://pay.example/cs_test_00000001') as id;
grant select on g1 to public;
select is((select status::text from public.payments where id = (select id from g1)), 'pending', 'GWY-001 a started payment is pending');
select is((select public.start_gateway_payment((select (r ->> 'id')::uuid from o), (select id from inv), 'stripe', 'cs_test_00000001', 105000, 'https://pay.example/x')), (select id from g1), 'GWY-002 starting twice returns the same payment');
select is((select paid_minor from public.orders where id = (select (r ->> 'id')::uuid from o)), 0::bigint, 'GWY-003 a pending payment does not count as paid');
select throws_ok(format($$select public.start_gateway_payment(%L, null, 'stripe', 'cs_test_toomuch1', 999999999, 'https://x')$$, (select r ->> 'id' from o)), 'P0001', 'The payment is more than the balance', 'GWY-004 the amount is bounded by the balance');
select throws_ok($$select public.settle_gateway_payment('stripe', 'cs_test_00000001', 'evt_1', 105000, 'AED', now())$$, '42501', null, 'GWY-005 staff cannot settle a payment, only verified webhooks can');
reset role;

-- Webhook settlement (service role)
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
set local role service_role;
select is((select public.settle_gateway_payment('stripe', 'cs_test_00000001', 'evt_1', 105000, 'AED', now(), '{"id":"x"}')), 'settled', 'GWY-006 a verified event settles the payment');
select is((select public.settle_gateway_payment('stripe', 'cs_test_00000001', 'evt_1', 105000, 'AED', now())), 'duplicate_event', 'GWY-007 a replayed event is ignored');
select is((select public.settle_gateway_payment('stripe', 'cs_test_00000001', 'evt_2', 105000, 'AED', now())), 'already_settled', 'GWY-008 a second event for the same payment changes nothing');
select is((select public.settle_gateway_payment('stripe', 'cs_unknown', 'evt_3', 100, 'AED', now())), 'unknown_payment', 'GWY-009 unknown references are acknowledged and ignored');
reset role;
select is((select paid_minor from public.orders where id = (select (r ->> 'id')::uuid from o)), 105000::bigint, 'GWY-010 the order is credited exactly once');
select is((select status::text from public.invoices where id = (select id from inv)), 'paid', 'GWY-011 the invoice is paid');
select is((select count(*)::int from public.outbox where event = 'payment.succeeded'), 1, 'GWY-012 one receipt event');

-- A mismatched amount is not applied and alerts super admins
insert into public.orders (id, number, customer_id, type, status, total_minor, tax_minor) values ('00000000-0000-0000-0000-00000000f0a5', 'TP-TEST-0000A5', '00000000-0000-0000-0000-00000000c005', 'local', 'confirmed', 50000, 2500);
insert into public.payments (order_id, gateway, gateway_ref, method, amount_minor, status) values ('00000000-0000-0000-0000-00000000f0a5', 'stripe', 'cs_test_mismatch1', 'link', 52500, 'pending');
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
set local role service_role;
select is((select public.settle_gateway_payment('stripe', 'cs_test_mismatch1', 'evt_4', 100, 'AED', now())), 'amount_mismatch', 'GWY-013 a different amount is not applied');
reset role;
select is((select status::text from public.payments where gateway_ref = 'cs_test_mismatch1'), 'pending', 'GWY-014 the payment stays pending');
select is((select count(*)::int from public.notifications where title = 'Payment amount mismatch' and user_id = '00000000-0000-0000-0000-0000000000a5'), 1, 'GWY-015 super admins are alerted');

-- Failure marks the payment failed and queues a staff alert
insert into public.payments (order_id, gateway, gateway_ref, method, amount_minor, status) values ('00000000-0000-0000-0000-00000000f0a5', 'stripe', 'cs_test_fail0001', 'link', 52500, 'pending');
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
set local role service_role;
select is((select public.fail_gateway_payment('stripe', 'cs_test_fail0001', 'evt_5', 'card declined')), 'failed', 'GWY-016 a failed payment is marked failed');
select is((select public.fail_gateway_payment('stripe', 'cs_test_fail0001', 'evt_5', 'card declined')), 'duplicate_event', 'GWY-017 the replay is ignored');
reset role;
select is((select count(*)::int from public.outbox where event = 'payment.failed'), 1, 'GWY-018 one failure event');

-- Gateway refunds: request, approve (not yet processed), gateway call, completion
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b5","role":"authenticated"}', true);
set local role authenticated;
create temp table rf on commit drop as select public.request_refund((select id from public.payments where gateway_ref = 'cs_test_00000001'), 30000, 'returned item') as id;
grant select on rf to public;
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a5","role":"authenticated"}', true);
set local role authenticated;
select is((select public.decide_refund((select id from rf), true, 'ok')), 'approved', 'GWY-019 approving a gateway refund does not process it yet');
select is((select paid_minor from public.orders where id = (select (r ->> 'id')::uuid from o)), 105000::bigint, 'GWY-020 balances do not move until the gateway confirms');
select is((select gateway from public.refund_context((select id from rf))), 'stripe', 'GWY-021 the approver can read the gateway context');
select lives_ok(format($$select public.complete_gateway_refund(%L, 're_test_0001')$$, (select id from rf)), 'GWY-022 completing records the gateway refund');
select is((select paid_minor from public.orders where id = (select (r ->> 'id')::uuid from o)), 75000::bigint, 'GWY-023 now the order paid amount drops');
select is((select status::text from public.payments where gateway_ref = 'cs_test_00000001'), 'partially_refunded', 'GWY-024 the payment is partially refunded');
select throws_ok(format($$select public.complete_gateway_refund(%L, 're_again')$$, (select id from rf)), 'P0001', 'That refund is not approved', 'GWY-025 a refund completes once');
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b5","role":"authenticated"}', true);
set local role authenticated;
select throws_ok(format($$select public.complete_gateway_refund(%L, 're_x')$$, (select id from rf)), '42501', null, 'GWY-026 operators cannot complete refunds');
reset role;

select * from finish();
rollback;
