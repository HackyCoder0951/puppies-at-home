begin;
select plan(3);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000f1', 'f1@dev.test'),
  ('00000000-0000-0000-0000-0000000000f2', 'f2@dev.test'),
  ('00000000-0000-0000-0000-0000000000f3', 'f3@dev.test');
insert into public.profiles (user_id, full_name, role, disabled_at) values
  ('00000000-0000-0000-0000-0000000000f1', 'Staff One', 'operator', null),
  ('00000000-0000-0000-0000-0000000000f2', 'Staff Two', 'operator', null),
  ('00000000-0000-0000-0000-0000000000f3', 'Staff Gone', 'operator', now());

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f1","role":"authenticated"}', true);
set local role authenticated;
select ok((select count(*) from public.list_staff() where full_name in ('Staff One', 'Staff Two')) = 2, 'an operator sees active colleagues');
select ok((select count(*) from public.list_staff() where full_name = 'Staff Gone') = 0, 'disabled staff are not listed');
reset role;

set local role anon;
select throws_ok('select * from public.list_staff()', '42501', null, 'anon cannot list staff');
reset role;

select * from finish();
rollback;
