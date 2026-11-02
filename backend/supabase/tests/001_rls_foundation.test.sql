-- RLS and permission tests for identity, content, CRM and storage (docs/03-security-privacy/07 section 9).
begin;
create extension if not exists pgtap with schema extensions;
select * from no_plan();

-- Fixtures (run as the owner role)
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@example.test', '', now(), now(), now()),
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'op@example.test', '', now(), now(), now()),
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'opflag@example.test', '', now(), now(), now()),
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'disabled@example.test', '', now(), now(), now());
insert into public.profiles (user_id, full_name, role, can_edit_templates, disabled_at) values
  ('00000000-0000-0000-0000-0000000000a1', 'Test Admin', 'super_admin', false, null),
  ('00000000-0000-0000-0000-0000000000b1', 'Test Operator', 'operator', false, null),
  ('00000000-0000-0000-0000-0000000000c1', 'Flag Operator', 'operator', true, null),
  ('00000000-0000-0000-0000-0000000000d1', 'Disabled Operator', 'operator', false, now());
insert into public.puppies (slug, name, breed, sex, age_text, origin, status, price_minor, published_at) values
  ('test-published', 'Pub', 'Maltipoo', 'male', '3 months', 'imported', 'available', 500000, now()),
  ('test-draft', 'Draft', 'Poodle', 'female', '2 months', 'local', 'available', 400000, null);
insert into storage.objects (bucket_id, name, owner) values ('media-drafts', 'puppies/test/draft.jpg', null), ('site-media', 'puppies/test/pub.jpg', null);

-- RLS-001: anon cannot read base tables
set local role anon;
select throws_ok('select * from public.puppies', '42501', null, 'RLS-001 anon cannot select puppies');
select throws_ok('select * from public.profiles', '42501', null, 'RLS-001 anon cannot select profiles');
select throws_ok('select * from public.customers', '42501', null, 'RLS-001 anon cannot select customers');
select throws_ok('select * from public.enquiries', '42501', null, 'RLS-001 anon cannot select enquiries');
select throws_ok('select * from public.audit_log', '42501', null, 'RLS-001 anon cannot select audit_log');
select throws_ok('select * from public.site_settings', '42501', null, 'RLS-001 anon cannot select site_settings');

-- RLS-002: public views show only published rows and never the price
select is((select count(*)::int from public.v_public_puppies where slug like 'test-%'), 1, 'RLS-002 anon sees only the published test puppy');
select is((select count(*)::int from public.v_public_settings), 9, 'RLS-002 public settings view returns the seeded public rows');
reset role;
select hasnt_column('public', 'v_public_puppies', 'price_minor', 'RLS-002 public view has no price column');
select hasnt_column('public', 'v_public_puppies', 'story', 'RLS-002 public view has no internal story column');

-- RLS-003: create_enquiry
set local role anon;
select lives_ok($$select public.create_enquiry('{"source":"contact","name":"Sam Test","phone":"+971 50 123 4567","email":"sam@example.test","message":"Hello","marketing":false,"whatsappUpdates":true,"consentTextVersion":"v1","sourcePage":"/contact"}'::jsonb)$$, 'RLS-003 valid enquiry is accepted');
select throws_ok($$select public.create_enquiry('{"source":"contact","name":"Sam Test","phone":"123"}'::jsonb)$$, '22023', 'invalid phone', 'RLS-003 invalid phone is rejected');
select throws_ok($$select public.create_enquiry('{"source":"nope","name":"Sam Test","phone":"+971501234567"}'::jsonb)$$, '22023', 'invalid source', 'RLS-003 invalid source is rejected');
reset role;
select is((select count(*)::int from public.enquiries where name = 'Sam Test'), 1, 'RLS-003 enquiry stored once');
select is((select count(*)::int from public.consent_records c join public.customers u on u.id = c.customer_id where u.phone_e164 = '+971501234567'), 2, 'RLS-003 consent evidence stored (reply and WhatsApp)');
select lives_ok($$select public.create_enquiry('{"source":"puppy","name":"Sam Test","phone":"+971501234567","puppy":"test-published"}'::jsonb)$$, 'repeat enquiry accepted');
select is((select count(*)::int from public.customers where phone_e164 = '+971501234567'), 1, 'repeat enquiry reuses the customer');

-- Helper permission checks
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}', true);
set local role authenticated;
select is((select app_private.has_permission('users.manage')), false, 'operator lacks users.manage');
select is((select app_private.has_permission('content.publish')), true, 'operator has content.publish');
select is((select app_private.has_permission('templates.edit')), false, 'operator without flag cannot edit templates');

-- RLS-004: operator cannot read audit_log; RLS-005 cannot change roles
select is((select count(*)::int from public.audit_log), 0, 'RLS-004 operator sees no audit rows');
select throws_ok($$update public.profiles set role = 'super_admin' where user_id = '00000000-0000-0000-0000-0000000000b1'$$, '42501', null, 'RLS-005 operator cannot promote self');
select lives_ok($$update public.profiles set role = 'super_admin' where user_id = '00000000-0000-0000-0000-0000000000c1'$$, 'update of another profile runs but matches no rows');
reset role;
select is((select role::text from public.profiles where user_id = '00000000-0000-0000-0000-0000000000c1'), 'operator', 'RLS-005 operator cannot change another profile');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}', true);
set local role authenticated;

-- RLS-008: operator can edit but not delete content
select lives_ok($$update public.puppies set age_text = '4 months' where slug = 'test-draft'$$, 'operator can edit a puppy');
select throws_ok($$update public.puppies set deleted_at = now() where slug = 'test-draft'$$, '42501', null, 'RLS-008 operator cannot soft-delete a puppy');
reset role;

-- Template flag
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated"}', true);
set local role authenticated;
select is((select app_private.has_permission('templates.edit')), true, 'RLS-009 flag grants templates.edit');
reset role;

-- RLS-010: a disabled operator sees nothing
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}', true);
set local role authenticated;
select is((select count(*)::int from public.puppies), 0, 'RLS-010 disabled operator reads nothing');
reset role;

-- RLS-015: the last super admin cannot be demoted
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
set local role authenticated;
select throws_ok($$update public.profiles set role = 'operator' where user_id = '00000000-0000-0000-0000-0000000000a1'$$, 'P0001', null, 'RLS-015 last super admin cannot be demoted');
select is((select count(*) > 0 from public.audit_log), true, 'super admin can read audit rows');
reset role;

-- RLS-017: storage drafts are private; published media is public
set local role anon;
select is((select count(*)::int from storage.objects where bucket_id = 'media-drafts'), 0, 'RLS-017 anon cannot see draft media');
select is((select count(*)::int from storage.objects where bucket_id = 'site-media' and name = 'puppies/test/pub.jpg'), 1, 'anon can see published media');
reset role;

-- Login lockout helper (service role only)
set local role authenticated;
select throws_ok($$select public.record_login_attempt('h', 'i', false)$$, '42501', null, 'authenticated cannot call record_login_attempt');
reset role;
set local role service_role;
select is((select public.record_login_attempt('lock-test', 'i', false, 2, 15)), false, 'first failure does not lock');
select is((select public.record_login_attempt('lock-test', 'i', false, 2, 15)), true, 'second failure locks at threshold 2');
reset role;

select * from finish();
rollback;
