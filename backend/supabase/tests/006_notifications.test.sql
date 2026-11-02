begin;
select no_plan();

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a7', 'sa7@dev.test'),
  ('00000000-0000-0000-0000-0000000000b7', 'op7@dev.test'),
  ('00000000-0000-0000-0000-0000000000b6', 'op6@dev.test');
insert into public.profiles (user_id, full_name, role) values
  ('00000000-0000-0000-0000-0000000000a7', 'Super Seven', 'super_admin'),
  ('00000000-0000-0000-0000-0000000000b7', 'Operator Seven', 'operator'),
  ('00000000-0000-0000-0000-0000000000b6', 'Operator Six', 'operator');
insert into public.customers (id, full_name, phone_e164, email) values ('00000000-0000-0000-0000-00000000c007', 'Notify Customer', '+971500000707', 'n@dev.test');
delete from public.outbox;

-- T-NOT-01: a rolled-back change leaves no event
savepoint before_enquiry;
insert into public.enquiries (id, customer_id, source, name, phone) values ('00000000-0000-0000-0000-00000000e001', '00000000-0000-0000-0000-00000000c007', 'manual', 'Notify Customer', '+971500000707');
select is((select count(*)::int from public.outbox where event = 'enquiry.created'), 1, 'NOT-001 the event exists inside the transaction');
rollback to savepoint before_enquiry;
select is((select count(*)::int from public.outbox where event = 'enquiry.created'), 0, 'NOT-002 a rollback leaves no outbox row');

-- Committed change: one event, no duplicates on a repeated trigger
insert into public.enquiries (id, customer_id, source, name, phone) values ('00000000-0000-0000-0000-00000000e002', '00000000-0000-0000-0000-00000000c007', 'manual', 'Notify Customer', '+971500000707');
select is((select count(*)::int from public.outbox where event = 'enquiry.created' and entity_id = '00000000-0000-0000-0000-00000000e002'), 1, 'NOT-003 an enquiry raises one event');
select is((select (payload ->> 'customerId')::uuid from public.outbox where event = 'enquiry.created' and entity_id = '00000000-0000-0000-0000-00000000e002'), '00000000-0000-0000-0000-00000000c007'::uuid, 'NOT-004 the payload carries ids only');
update public.enquiries set assigned_to = '00000000-0000-0000-0000-0000000000b7' where id = '00000000-0000-0000-0000-00000000e002';
select is((select count(*)::int from public.outbox where event = 'enquiry.assigned'), 1, 'NOT-005 assignment raises an event');

-- Order and delivery events
insert into public.orders (id, number, customer_id, type, total_minor) values ('00000000-0000-0000-0000-00000000f007', 'TP-TEST-000007', '00000000-0000-0000-0000-00000000c007', 'local', 1000);
update public.orders set status = 'confirmed' where id = '00000000-0000-0000-0000-00000000f007';
select is((select count(*)::int from public.outbox where event = 'order.confirmed'), 1, 'NOT-006 confirming raises order.confirmed');
update public.orders set status = 'deposit_paid' where id = '00000000-0000-0000-0000-00000000f007';
select is((select count(*)::int from public.outbox where event = 'order.status_changed'), 1, 'NOT-007 other moves raise order.status_changed');

-- Templates: variables are allow-listed, versions and rollback, permissions
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b7","role":"authenticated"}', true);
set local role authenticated;
select throws_ok($$select public.save_template('order_confirmed', 'email', 'x', 'Hello')$$, '42501', null, 'NOT-008 operators cannot edit templates');
select ok((select count(*) from public.message_templates) >= 13, 'NOT-009 operators can read templates');
select is((select count(*)::int from public.notification_rules), 0, 'NOT-010 operators cannot read rules');
select throws_ok($$select public.set_rule_enabled((select id from public.notification_rules limit 1), false)$$, '42501', null, 'NOT-011 operators cannot toggle rules');
reset role;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a7","role":"authenticated"}', true);
set local role authenticated;
select throws_ok($$select public.save_template('order_confirmed', 'email', 'Hi', 'Hello {{customer.password}}')$$, '22023', 'Unknown template variable {{customer.password}}', 'NOT-012 unknown variables are rejected');
select is((select public.save_template('order_confirmed', 'email', 'Order {{order.number}} confirmed', 'Hi {{customer.first_name}}, confirmed.')), 2, 'NOT-013 saving creates version 2');
select is((select count(*)::int from public.message_templates where key = 'order_confirmed' and is_active), 1, 'NOT-014 one active version');
select lives_ok($$select public.activate_template_version('order_confirmed', 'email', 1)$$, 'NOT-015 rollback to version 1');
select is((select version from public.message_templates where key = 'order_confirmed' and channel = 'email' and is_active), 1, 'NOT-016 version 1 is active again');
select throws_ok($$select public.save_template('no_such_template', 'email', 'x', 'y')$$, '22023', 'Unknown template', 'NOT-017 new keys cannot be invented');
select lives_ok($$select public.set_rule_enabled((select id from public.notification_rules where event = 'enquiry.created' and channel = 'email'), false)$$, 'NOT-018 a super admin disables a rule');
select is((select enabled from public.notification_rules where event = 'enquiry.created' and channel = 'email'), false, 'NOT-019 the rule is off');
reset role;

-- In-app notifications are private to their owner (T-NOT-04)
insert into public.notifications (user_id, title) values ('00000000-0000-0000-0000-0000000000b7', 'For seven'), ('00000000-0000-0000-0000-0000000000b6', 'For six');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b7","role":"authenticated"}', true);
set local role authenticated;
select is((select array_agg(title) from public.notifications), array['For seven'], 'NOT-020 a user sees only their own notifications');
select is((select public.mark_notifications_read()), 1, 'NOT-021 marking read touches only the caller''s rows');
reset role;
select is((select count(*)::int from public.notifications where title = 'For six' and read_at is null), 1, 'NOT-022 the other user''s notification is untouched');

-- Manual message queue
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b7","role":"authenticated"}', true);
set local role authenticated;
select lives_ok($$select public.queue_manual_message('00000000-0000-0000-0000-00000000c007', null, 'order_status_update', 'email')$$, 'NOT-023 staff queue a manual message');
select throws_ok($$select public.queue_manual_message('00000000-0000-0000-0000-00000000c007', null, 'nope', 'email')$$, '22023', null, 'NOT-024 unknown templates are refused');
select throws_ok($$select * from public.claim_outbox(5)$$, '42501', null, 'NOT-025 only the worker can claim the outbox');
reset role;

-- Worker mechanics (service role): claim, retry with backoff, final failure alerts super admins
delete from public.outbox;
insert into public.outbox (event, entity, entity_id, dedupe_key) values ('test.event', 'x', '1', 'test:1'), ('test.event', 'x', '2', 'test:2');
set local role service_role;
select is((select count(*)::int from public.claim_outbox(10)), 2, 'NOT-026 the worker claims due rows');
select is((select count(*)::int from public.claim_outbox(10)), 0, 'NOT-027 claimed rows are not claimed again');
select is((select public.fail_outbox((select id from public.outbox where dedupe_key = 'test:1'), 'provider down')), 'retry', 'NOT-028 a failure schedules a retry');
select ok((select next_attempt_at > now() from public.outbox where dedupe_key = 'test:1'), 'NOT-029 the retry is in the future');
select lives_ok($$select public.complete_outbox((select id from public.outbox where dedupe_key = 'test:2'))$$, 'NOT-030 completing marks the row done');
reset role;
update public.outbox set attempts = 5, status = 'processing' where dedupe_key = 'test:1';
set local role service_role;
select is((select public.fail_outbox((select id from public.outbox where dedupe_key = 'test:1'), 'still down')), 'failed', 'NOT-031 the fifth failure is final');
reset role;
select is((select count(*)::int from public.notifications where kind = 'alert' and user_id = '00000000-0000-0000-0000-0000000000a7'), 1, 'NOT-032 a final failure alerts super admins');

select * from finish();
rollback;
