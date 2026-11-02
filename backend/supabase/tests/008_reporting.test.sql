begin;
select no_plan();

insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000a4', 'sa4@dev.test'), ('00000000-0000-0000-0000-0000000000b4', 'op4@dev.test');
insert into public.profiles (user_id, full_name, role) values ('00000000-0000-0000-0000-0000000000a4', 'Super Four', 'super_admin'), ('00000000-0000-0000-0000-0000000000b4', 'Operator Four', 'operator');
insert into public.customers (id, full_name, phone_e164) values ('00000000-0000-0000-0000-00000000c004', 'Report Customer', '+971500000404');
insert into public.enquiries (customer_id, source, name, phone) values ('00000000-0000-0000-0000-00000000c004', 'manual', 'Report Customer', '+971500000404');
insert into public.orders (id, number, customer_id, type, status, total_minor, tax_minor) values ('00000000-0000-0000-0000-00000000f004', 'TP-TEST-000004', '00000000-0000-0000-0000-00000000c004', 'local', 'confirmed', 100000, 5000);
insert into public.payments (order_id, gateway, gateway_ref, method, amount_minor, status) values ('00000000-0000-0000-0000-00000000f004', 'manual', 'report-payment-1', 'cash', 20000, 'succeeded');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b4","role":"authenticated"}', true);
set local role authenticated;
select ok((select (public.admin_dashboard_stats() -> 'enquiries' ->> 'new')::int) >= 1, 'RPT-001 staff read dashboard counts');
select ok((select (public.admin_dashboard_stats() -> 'money' ->> 'paidThisMonthMinor')::bigint) >= 20000, 'RPT-002 payments this month are summed');
select is((select public.admin_dashboard_stats() -> 'orders' -> 'byStatus' ->> 'confirmed')::int >= 1, true, 'RPT-003 orders are grouped by status');
select throws_ok($$select * from public.export_rows('enquiries', current_date - 30, current_date)$$, '42501', null, 'RPT-004 operators cannot export enquiries');
select throws_ok($$select * from public.export_rows('payments', current_date - 30, current_date)$$, '42501', null, 'RPT-005 operators cannot export payments');
reset role;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a4","role":"authenticated"}', true);
set local role authenticated;
select ok((select count(*) from public.export_rows('enquiries', current_date - 1, current_date)) >= 1, 'RPT-006 a super admin exports enquiries');
select ok((select (r ->> 'amount_minor')::bigint from public.export_rows('payments', current_date - 1, current_date) r where r ->> 'gateway_ref' = 'report-payment-1') = 20000, 'RPT-007 payment export rows carry minor units');
select throws_ok($$select * from public.export_rows('payments', current_date - 400, current_date)$$, '22023', null, 'RPT-008 ranges over a year are refused');
select throws_ok($$select * from public.export_rows('customers', current_date - 1, current_date)$$, '22023', 'Unknown export', 'RPT-009 customers are not exportable here');
reset role;

set local role anon;
select throws_ok($$select public.admin_dashboard_stats()$$, '42501', null, 'RPT-010 anonymous visitors get nothing');
reset role;

select * from finish();
rollback;
