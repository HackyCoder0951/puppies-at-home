begin;
select no_plan();

-- Fixtures: a super admin, an operator, a customer, two puppies
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a9', 'sa9@dev.test'),
  ('00000000-0000-0000-0000-0000000000b9', 'op9@dev.test');
insert into public.profiles (user_id, full_name, role) values
  ('00000000-0000-0000-0000-0000000000a9', 'Super Nine', 'super_admin'),
  ('00000000-0000-0000-0000-0000000000b9', 'Operator Nine', 'operator');
insert into public.customers (id, full_name, phone_e164) values ('00000000-0000-0000-0000-00000000c001', 'Order Customer', '+971500000123');
insert into public.puppies (id, slug, breed, sex, age_text, origin, status, price_minor) values
  ('00000000-0000-0000-0000-00000000d001', 'test-pup-one', 'Maltipoo', 'male', '3 months', 'local', 'available', 450000),
  ('00000000-0000-0000-0000-00000000d002', 'test-pup-two', 'Shih Tzu', 'female', '2 months', 'imported', 'available', 380000);

-- Anonymous visitors cannot read or call anything
set local role anon;
select throws_ok($$select count(*) from public.orders$$, '42501', null, 'COM-001 anon cannot read orders');
select throws_ok($$select public.create_order('00000000-0000-0000-0000-00000000c001', null, 'local', '[]'::jsonb)$$, '42501', null, 'COM-002 anon cannot create orders');
reset role;

-- Operator creates an order: number format, puppy reserved, totals computed
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b9","role":"authenticated"}', true);
set local role authenticated;
create temp table made on commit drop as
  select public.create_order('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000d001', 'local',
    '[{"description":"Maltipoo puppy","quantity":1,"unitMinor":450000},{"description":"Vaccination pack","quantity":2,"unitMinor":15000}]'::jsonb, 100000, 'first order') as r;
grant select on made to public;
select matches((select r ->> 'number' from made), '^TP-[0-9]{4}-[0-9]{6}$', 'COM-003 order number format');
select is((select total_minor from public.orders where id = (select (r ->> 'id')::uuid from made)), 480000::bigint, 'COM-004 total is the sum of the items');
select is((select balance_minor from public.orders where id = (select (r ->> 'id')::uuid from made)), 480000::bigint, 'COM-005 balance equals total before payments');
select is((select count(*)::int from public.order_events where order_id = (select (r ->> 'id')::uuid from made)), 1, 'COM-006 creation writes a timeline event');
reset role;
select is((select status::text from public.puppies where id = '00000000-0000-0000-0000-00000000d001'), 'reserved', 'COM-007 the puppy is reserved');

-- A second order cannot take the reserved puppy
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b9","role":"authenticated"}', true);
set local role authenticated;
select throws_ok($$select public.create_order('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000d001', 'local', '[{"description":"x y","quantity":1,"unitMinor":1}]'::jsonb)$$, 'P0001', 'That puppy is not available', 'COM-008 a reserved puppy cannot be sold twice');
select throws_ok($$select public.create_order('00000000-0000-0000-0000-00000000c001', null, 'local', '[]'::jsonb)$$, '22023', null, 'COM-009 an order needs items');

-- State machine: invalid jumps are rejected, valid moves are recorded
select throws_ok(format($$select public.transition_order(%L, 'delivered')$$, (select r ->> 'id' from made)), 'P0001', null, 'COM-010 new to delivered is rejected');
select lives_ok(format($$select public.transition_order(%L, 'confirmed')$$, (select r ->> 'id' from made)), 'COM-011 new to confirmed');
select lives_ok(format($$select public.transition_order(%L, 'deposit_paid')$$, (select r ->> 'id' from made)), 'COM-012 confirmed to deposit_paid');
-- Operators cannot cancel after the deposit; cancelling needs a reason
select throws_ok(format($$select public.transition_order(%L, 'cancelled', 'changed mind')$$, (select r ->> 'id' from made)), '42501', null, 'COM-013 operator cannot cancel after the deposit');
reset role;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a9","role":"authenticated"}', true);
set local role authenticated;
select throws_ok(format($$select public.transition_order(%L, 'cancelled', '')$$, (select r ->> 'id' from made)), 'P0001', 'Cancelling requires a reason', 'COM-014 cancelling needs a reason');
reset role;

-- Direct SQL cannot skip the machine either (the trigger applies to every path)
select throws_ok(format($$update public.orders set status = 'completed' where id = %L$$, (select r ->> 'id' from made)), 'P0001', null, 'COM-015 direct update cannot skip states');

-- Local orders may go from deposit_paid straight to delivered; delivery marks the puppy gone home
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b9","role":"authenticated"}', true);
set local role authenticated;
select lives_ok(format($$select public.transition_order(%L, 'delivered')$$, (select r ->> 'id' from made)), 'COM-016 local order skips preparing and transit');
reset role;
select is((select status::text from public.puppies where id = '00000000-0000-0000-0000-00000000d001'), 'gone_home', 'COM-017 delivered marks the puppy gone home');
select is((select count(*)::int from public.order_events where order_id = (select (r ->> 'id')::uuid from made)), 4, 'COM-018 every move is on the timeline');

-- Cancelling an imported order before the deposit releases its puppy
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b9","role":"authenticated"}', true);
set local role authenticated;
create temp table made2 on commit drop as
  select public.create_order('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000d002', 'imported', '[{"description":"Shih Tzu puppy","quantity":1,"unitMinor":380000}]'::jsonb) as r;
grant select on made2 to public;
select lives_ok(format($$select public.transition_order(%L, 'cancelled', 'customer changed mind')$$, (select r ->> 'id' from made2)), 'COM-019 operator cancels before the deposit');
reset role;
select is((select status::text from public.puppies where id = '00000000-0000-0000-0000-00000000d002'), 'available', 'COM-020 the puppy is released');
select is((select cancel_reason from public.orders where id = (select (r ->> 'id')::uuid from made2)), 'customer changed mind', 'COM-021 the cancel reason is stored');

-- Deliveries
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b9","role":"authenticated"}', true);
set local role authenticated;
create temp table dl on commit drop as
  select public.create_delivery((select (r ->> 'id')::uuid from made), 'dubai_delivery', 'Own van', null, '{"line1":"Marina"}'::jsonb, current_date + 1) as id;
grant select on dl to public;
select throws_ok(format($$select public.transition_delivery(%L, 'delivered')$$, (select id from dl)), 'P0001', null, 'COM-022 scheduled to delivered is rejected');
select lives_ok(format($$select public.transition_delivery(%L, 'packed')$$, (select id from dl)), 'COM-023 scheduled to packed');
select lives_ok(format($$select public.transition_delivery(%L, 'delayed', 'traffic')$$, (select id from dl)), 'COM-024 delayed can interleave');
select lives_ok(format($$select public.transition_delivery(%L, 'dispatched')$$, (select id from dl)), 'COM-025 delayed to dispatched');
select throws_ok(format($$select public.transition_delivery(%L, 'failed')$$, (select id from dl)), 'P0001', 'A failed delivery needs a note', 'COM-026 failure needs a note');
select lives_ok(format($$select public.transition_delivery(%L, 'in_transit', null, 'Sheikh Zayed Rd')$$, (select id from dl)), 'COM-027 in transit with location');
select lives_ok(format($$select public.transition_delivery(%L, 'arrived')$$, (select id from dl)), 'COM-028 arrived');
select lives_ok(format($$select public.transition_delivery(%L, 'delivered')$$, (select id from dl)), 'COM-029 delivered');
select throws_ok(format($$select public.transition_delivery(%L, 'packed')$$, (select id from dl)), 'P0001', null, 'COM-030 delivered is terminal');
select is((select count(*)::int from public.delivery_events where delivery_id = (select id from dl)), 7, 'COM-031 events: scheduled, packed, delayed, dispatched, in transit, arrived, delivered');
select isnt((select delivered_at from public.deliveries where id = (select id from dl)), null, 'COM-032 delivered_at is stamped');
reset role;

select * from finish();
rollback;
