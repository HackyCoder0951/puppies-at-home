begin;
select no_plan();

insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000a3', 'sa3@dev.test'), ('00000000-0000-0000-0000-0000000000b3', 'op3@dev.test');
insert into public.profiles (user_id, full_name, role) values ('00000000-0000-0000-0000-0000000000a3', 'Super Three', 'super_admin'), ('00000000-0000-0000-0000-0000000000b3', 'Operator Three', 'operator');
insert into public.customers (id, full_name, phone_e164, email, area, notes, whatsapp_opt_in_at) values ('00000000-0000-0000-0000-00000000c003', 'Privacy Person', '+971500000303', 'privacy@dev.test', 'Marina', 'prefers mornings', now());
insert into public.enquiries (id, customer_id, source, name, phone, email, message, ip_hash, user_agent) values ('00000000-0000-0000-0000-00000000e003', '00000000-0000-0000-0000-00000000c003', 'manual', 'Privacy Person', '+971500000303', 'privacy@dev.test', 'secret message', 'iphash', 'agent');
insert into public.enquiry_notes (enquiry_id, author_id, body) values ('00000000-0000-0000-0000-00000000e003', '00000000-0000-0000-0000-0000000000b3', 'called, has two kids');
insert into public.consent_records (customer_id, purpose, text_version, channel, ip_hash) values ('00000000-0000-0000-0000-00000000c003', 'whatsapp_updates', 'v1', 'web_form', 'iphash');
insert into public.orders (id, number, customer_id, type, status, total_minor, notes) values ('00000000-0000-0000-0000-00000000f003', 'TP-TEST-000003', '00000000-0000-0000-0000-00000000c003', 'local', 'confirmed', 100000, 'deliver to villa 12');
insert into public.deliveries (order_id, method, address) values ('00000000-0000-0000-0000-00000000f003', 'dubai_delivery', '{"text":"Villa 12, Marina"}');
insert into public.messages (customer_id, channel, provider, to_address, subject, body, idempotency_key) values ('00000000-0000-0000-0000-00000000c003', 'email', 'log', 'privacy@dev.test', 'Hello', 'Hi Privacy', 'prv-test-1');

-- The audit log is append-only
select throws_ok($$update public.audit_log set action = 'x' where id = (select min(id) from public.audit_log)$$, 'P0001', 'The audit log is append-only', 'PRV-001 audit rows cannot be edited');
select throws_ok($$delete from public.audit_log where id = (select min(id) from public.audit_log)$$, 'P0001', 'The audit log is append-only', 'PRV-002 audit rows cannot be deleted');
select throws_ok($$truncate public.audit_log$$, 'P0001', 'The audit log is append-only', 'PRV-003 the audit log cannot be truncated');

-- Operators have intake only
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b3","role":"authenticated"}', true);
set local role authenticated;
select throws_ok($$select public.export_subject('00000000-0000-0000-0000-00000000c003')$$, '42501', null, 'PRV-004 operators cannot export a subject');
select throws_ok($$select public.anonymise_subject('00000000-0000-0000-0000-00000000c003')$$, '42501', null, 'PRV-005 operators cannot erase');
select throws_ok($$select public.set_processing_restriction('00000000-0000-0000-0000-00000000c003', true)$$, '42501', null, 'PRV-006 operators cannot restrict processing');
select lives_ok($$select public.create_dsr('access', 'Privacy Person', 'privacy@dev.test', 'Please send me my data', '00000000-0000-0000-0000-00000000c003')$$, 'PRV-007 operators can log a request at intake');
reset role;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a3","role":"authenticated"}', true);
set local role authenticated;
create temp table doc on commit drop as select public.export_subject('00000000-0000-0000-0000-00000000c003') as j;
grant select on doc to public;
select is((select j -> 'customer' ->> 'email' from doc), 'privacy@dev.test', 'PRV-008 the export holds the profile');
select is((select j -> 'enquiries' -> 0 ->> 'message' from doc), 'secret message', 'PRV-009 the export holds enquiries');
select is((select j -> 'enquiries' -> 0 -> 'notes' -> 0 ->> 'note' from doc), 'called, has two kids', 'PRV-010 the export holds staff notes about the person');
select is((select j -> 'orders' -> 0 ->> 'number' from doc), 'TP-TEST-000003', 'PRV-011 the export holds orders');
select is((select j -> 'orders' -> 0 -> 'deliveries' -> 0 -> 'address' ->> 'text' from doc), 'Villa 12, Marina', 'PRV-012 the export holds delivery addresses');
select is((select j -> 'messages' -> 0 ->> 'body' from doc), 'Hi Privacy', 'PRV-013 the export holds messages');
select is((select count(*)::int from public.audit_log where action = 'privacy.export'), 1, 'PRV-014 every export is audited');

-- Restriction and consent withdrawal
select lives_ok($$select public.set_processing_restriction('00000000-0000-0000-0000-00000000c003', true)$$, 'PRV-015 a super admin restricts processing');
select isnt((select restricted_at from public.customers where id = '00000000-0000-0000-0000-00000000c003'), null, 'PRV-016 the flag is set');
select is((select public.withdraw_consent('00000000-0000-0000-0000-00000000c003', 'whatsapp_updates', 'email')), 1, 'PRV-017 withdrawing records the withdrawal');
select isnt((select whatsapp_opted_out_at from public.customers where id = '00000000-0000-0000-0000-00000000c003'), null, 'PRV-018 WhatsApp is opted out at once');

-- Erasure by anonymisation
create temp table dsr on commit drop as select id from public.dsr_requests limit 1;
grant select on dsr to public;
create temp table summary on commit drop as select public.anonymise_subject('00000000-0000-0000-0000-00000000c003', (select id from dsr)) as j;
grant select on summary to public;
reset role;
select is((select full_name from public.customers where id = '00000000-0000-0000-0000-00000000c003'), 'Anonymised customer', 'PRV-019 the profile is anonymised');
select is((select concat_ws('|', phone_e164, email, area, notes) from public.customers where id = '00000000-0000-0000-0000-00000000c003'), '', 'PRV-020 contact data and notes are gone');
select is((select concat_ws('|', phone, email, message, ip_hash, user_agent) from public.enquiries where id = '00000000-0000-0000-0000-00000000e003'), '', 'PRV-021 enquiry personal data is gone');
select is((select body from public.enquiry_notes where enquiry_id = '00000000-0000-0000-0000-00000000e003'), '[removed]', 'PRV-022 staff notes are removed');
select is((select body || coalesce(to_address, '') from public.messages where idempotency_key = 'prv-test-1'), '[removed]', 'PRV-023 message text is removed');
select is((select address from public.deliveries where order_id = '00000000-0000-0000-0000-00000000f003'), null, 'PRV-024 the delivery address is removed');
select is((select notes from public.orders where id = '00000000-0000-0000-0000-00000000f003'), null, 'PRV-025 order free text is removed');
select is((select number from public.orders where id = '00000000-0000-0000-0000-00000000f003'), 'TP-TEST-000003', 'PRV-026 the order itself is kept for legal reasons');
select is((select ip_hash from public.consent_records where customer_id = '00000000-0000-0000-0000-00000000c003'), null, 'PRV-027 consent evidence keeps the fact, not the IP hash');
select is((select count(*)::int from public.audit_log where action in ('insert', 'update', 'delete') and entity in ('customers', 'enquiries') and entity_id in ('00000000-0000-0000-0000-00000000c003', '00000000-0000-0000-0000-00000000e003') and (before is not null or after is not null)), 0, 'PRV-028 audit snapshots no longer carry the data');
select is((select count(*)::int from public.audit_log where action = 'privacy.anonymise' and entity_id = '00000000-0000-0000-0000-00000000c003'), 1, 'PRV-029 the erasure itself is audited');
select matches((select exceptions from public.dsr_requests where id = (select id from dsr)), 'kept for legal obligations', 'PRV-030 the request records the legal-retention exception');

-- Retention job (service role): old customers without orders go, recent ones stay
insert into public.customers (id, full_name, phone_e164, created_at) values ('00000000-0000-0000-0000-00000000c013', 'Old Lead', '+971500000313', now() - interval '30 months'), ('00000000-0000-0000-0000-00000000c023', 'Recent Lead', '+971500000323', now() - interval '2 months');
insert into public.login_attempts (email_hash, ip_hash, success, created_at) values ('h', 'h', false, now() - interval '40 days'), ('h', 'h', false, now() - interval '1 day');
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
set local role service_role;
create temp table job on commit drop as select public.anonymise_old_records() as j;
grant select on job to public;
reset role;
select is((select full_name from public.customers where id = '00000000-0000-0000-0000-00000000c013'), 'Anonymised customer', 'PRV-031 an old lead without orders is anonymised');
select is((select full_name from public.customers where id = '00000000-0000-0000-0000-00000000c023'), 'Recent Lead', 'PRV-032 a recent lead is untouched');
select is((select (j ->> 'loginAttemptsDeleted')::int from job), 1, 'PRV-033 login attempts older than 30 days are deleted');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a3","role":"authenticated"}', true);
set local role authenticated;
select throws_ok($$select public.prune_audit_log(8)$$, '42501', null, 'PRV-034 only the service role prunes the audit log');
reset role;
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
set local role service_role;
select throws_ok($$select public.prune_audit_log(3)$$, '22023', 'The audit log is kept for at least 7 years', 'PRV-036 even the service role keeps 7 years');
reset role;
set local role anon;
select throws_ok($$select public.export_subject('00000000-0000-0000-0000-00000000c003')$$, '42501', null, 'PRV-035 anonymous visitors cannot export anything');
reset role;

select * from finish();
rollback;
