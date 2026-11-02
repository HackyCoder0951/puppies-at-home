-- B5: active staff names for assignment and "assigned to" labels. Operators cannot read other profiles directly,
-- so this returns only id, name and role of active staff, and only to active staff.
create or replace function public.list_staff()
returns table (user_id uuid, full_name text, role public.app_role)
language sql
stable
security definer
set search_path = ''
as $$
  select p.user_id, p.full_name, p.role
  from public.profiles p
  where p.disabled_at is null and (select app_private.is_active_staff())
  order by p.full_name;
$$;
revoke all on function public.list_staff() from public, anon;
grant execute on function public.list_staff() to authenticated, service_role;
