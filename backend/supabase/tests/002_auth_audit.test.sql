begin;
select plan(4);

select ok(not has_function_privilege('anon', 'public.record_audit_event(uuid, text, text, text, jsonb, text, text)', 'execute'), 'anon cannot record audit events');
select ok(not has_function_privilege('authenticated', 'public.record_audit_event(uuid, text, text, text, jsonb, text, text)', 'execute'), 'authenticated cannot record audit events');
select ok(has_function_privilege('service_role', 'public.record_audit_event(uuid, text, text, text, jsonb, text, text)', 'execute'), 'service role can record audit events');

create temp table before_count as select count(*)::int as n from public.audit_log where action = 'auth.sign_in_failed';
grant select on before_count to service_role;
set local role service_role;
select public.record_audit_event(null, 'auth.sign_in_failed', 'auth', 'x', '{"reason":"invalid"}'::jsonb, 'hash', 'agent');
reset role;
select is((select count(*)::int from public.audit_log where action = 'auth.sign_in_failed') - (select n from before_count), 1, 'event stored');

select * from finish();
rollback;
