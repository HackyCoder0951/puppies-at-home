-- B1 identity and security: profiles, permissions, login attempts, audit log, idempotency, webhook de-duplication.
create type public.app_role as enum ('super_admin', 'operator');

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  role public.app_role not null default 'operator',
  can_edit_templates boolean not null default false,
  mfa_required boolean not null default false,
  disabled_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.role_permissions (
  role public.app_role not null,
  permission text not null,
  primary key (role, permission)
);

create table public.login_attempts (
  id bigint generated always as identity primary key,
  email_hash text not null,
  ip_hash text not null,
  success boolean not null,
  created_at timestamptz not null default now()
);
create index login_attempts_email_idx on public.login_attempts (email_hash, created_at desc);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  ip_hash text,
  user_agent text,
  request_id text,
  created_at timestamptz not null default now()
);
create index audit_log_entity_idx on public.audit_log (entity, entity_id, created_at desc);
create index audit_log_actor_idx on public.audit_log (actor_id, created_at desc);

create table public.idempotency_keys (
  key text primary key,
  scope text not null,
  response_hash text,
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  gateway text not null,
  event_id text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  primary key (gateway, event_id)
);

create table public.privacy_incidents (
  id uuid primary key default gen_random_uuid(),
  detected_at timestamptz not null,
  aware_at timestamptz not null,
  summary text not null,
  data_categories text[] not null default '{}',
  people_affected integer,
  risk_level text not null default 'unknown',
  authority_notified_at timestamptz,
  individuals_notified_at timestamptz,
  decision_reason text,
  status text not null default 'open',
  owner_id uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated before update on public.profiles for each row execute function app_private.set_updated_at();
create trigger privacy_incidents_updated before update on public.privacy_incidents for each row execute function app_private.set_updated_at();

-- Permission matrix (docs/03-security-privacy/07-rbac-and-rls-spec.md section 3).
insert into public.role_permissions (role, permission)
select 'super_admin', p from unnest(array[
  'dashboard.read',
  'content.read','content.write','content.publish','content.delete',
  'enquiries.read','enquiries.write','enquiries.assign','enquiries.export',
  'customers.read','customers.write','customers.merge','customers.delete',
  'orders.read','orders.write','orders.cancel','orders.delete',
  'deliveries.read','deliveries.write',
  'payments.read','payments.record','payments.refund.request','payments.refund.approve','payments.export',
  'invoices.read','invoices.write','invoices.issue','invoices.send','invoices.void',
  'templates.read','templates.use','templates.edit',
  'messages.read','messages.send',
  'rules.manage','notifications.own',
  'settings.read','settings.write',
  'users.manage','audit.read',
  'privacy.read','privacy.manage','privacy.export','privacy.erase','privacy.intake'
]) as p;

insert into public.role_permissions (role, permission)
select 'operator', p from unnest(array[
  'dashboard.read',
  'content.read','content.write','content.publish',
  'enquiries.read','enquiries.write','enquiries.assign',
  'customers.read','customers.write',
  'orders.read','orders.write','orders.cancel',
  'deliveries.read','deliveries.write',
  'payments.read','payments.record','payments.refund.request',
  'invoices.read','invoices.write','invoices.issue','invoices.send',
  'templates.read','templates.use',
  'messages.read','messages.send',
  'notifications.own',
  'settings.read',
  'privacy.intake'
]) as p;

-- Helpers (SECURITY DEFINER, empty search_path). Policies call them as (select app_private.has_permission('x')).
create or replace function app_private.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid()) and p.disabled_at is null
  );
$$;

create or replace function app_private.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p
  where p.user_id = (select auth.uid()) and p.disabled_at is null;
$$;

create or replace function app_private.has_permission(permission_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = (select auth.uid()) and p.disabled_at is null
      and (
        exists (select 1 from public.role_permissions rp where rp.role = p.role and rp.permission = permission_key)
        or (permission_key = 'templates.edit' and p.can_edit_templates)
      )
  );
$$;

grant execute on function app_private.is_active_staff(), app_private.current_app_role(), app_private.has_permission(text) to anon, authenticated, service_role;

-- Generic audit trigger: records actor, entity, before and after for the tables it is attached to.
create or replace function app_private.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_row jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  new_row jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  pk text := coalesce(new_row ->> 'id', old_row ->> 'id', new_row ->> 'user_id', old_row ->> 'user_id', new_row ->> 'key', old_row ->> 'key');
begin
  insert into public.audit_log (actor_id, action, entity, entity_id, before, after)
  values ((select auth.uid()), lower(tg_op), tg_table_name, pk, old_row, new_row);
  return coalesce(new, old);
end;
$$;

create trigger profiles_audit after insert or update or delete on public.profiles for each row execute function app_private.audit_row();

-- Profile safeguards: the last active super admin cannot be disabled or demoted; users cannot change their own role.
create or replace function app_private.guard_profiles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  other_admins integer;
  actor uuid := (select auth.uid());
begin
  if tg_op = 'DELETE' then
    return old;
  end if;
  if old.role = 'super_admin' and old.disabled_at is null
     and (new.role <> 'super_admin' or new.disabled_at is not null) then
    select count(*) into other_admins from public.profiles p
    where p.role = 'super_admin' and p.disabled_at is null and p.user_id <> old.user_id;
    if other_admins = 0 then
      raise exception 'The last active super admin cannot be disabled or demoted' using errcode = 'P0001';
    end if;
  end if;
  if actor is not null and actor = old.user_id and (new.role <> old.role or new.disabled_at is distinct from old.disabled_at or new.can_edit_templates <> old.can_edit_templates) then
    raise exception 'You cannot change your own role, status or flags' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger profiles_guard before update on public.profiles for each row execute function app_private.guard_profiles();

-- Row level security: enabled and forced everywhere; default deny.
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.role_permissions enable row level security;
alter table public.role_permissions force row level security;
alter table public.login_attempts enable row level security;
alter table public.login_attempts force row level security;
alter table public.audit_log enable row level security;
alter table public.audit_log force row level security;
alter table public.idempotency_keys enable row level security;
alter table public.idempotency_keys force row level security;
alter table public.webhook_events enable row level security;
alter table public.webhook_events force row level security;
alter table public.privacy_incidents enable row level security;
alter table public.privacy_incidents force row level security;

revoke all on public.profiles, public.role_permissions, public.login_attempts, public.audit_log,
  public.idempotency_keys, public.webhook_events, public.privacy_incidents from anon, authenticated;
grant select on public.profiles, public.role_permissions, public.audit_log, public.login_attempts, public.privacy_incidents to authenticated;
grant update (full_name, role, can_edit_templates, mfa_required, disabled_at, last_seen_at) on public.profiles to authenticated;
grant insert, update on public.privacy_incidents to authenticated;

create policy profiles_select on public.profiles for select to authenticated
  using (user_id = (select auth.uid()) or (select app_private.has_permission('users.manage')));
create policy profiles_update_own on public.profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy profiles_update_admin on public.profiles for update to authenticated
  using ((select app_private.has_permission('users.manage')))
  with check ((select app_private.has_permission('users.manage')));

create policy role_permissions_select on public.role_permissions for select to authenticated
  using ((select app_private.is_active_staff()));
create policy login_attempts_select on public.login_attempts for select to authenticated
  using ((select app_private.has_permission('audit.read')));
create policy audit_log_select on public.audit_log for select to authenticated
  using ((select app_private.has_permission('audit.read')));
create policy privacy_incidents_select on public.privacy_incidents for select to authenticated
  using ((select app_private.has_permission('privacy.read')));
create policy privacy_incidents_write on public.privacy_incidents for insert to authenticated
  with check ((select app_private.has_permission('privacy.manage')));
create policy privacy_incidents_update on public.privacy_incidents for update to authenticated
  using ((select app_private.has_permission('privacy.manage')))
  with check ((select app_private.has_permission('privacy.manage')));

-- Records one failed or successful sign-in attempt and tells the caller whether the account is currently locked.
create or replace function public.record_login_attempt(p_email_hash text, p_ip_hash text, p_success boolean, p_threshold integer default 10, p_lock_minutes integer default 15)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  failures integer;
begin
  insert into public.login_attempts (email_hash, ip_hash, success) values (p_email_hash, p_ip_hash, p_success);
  if p_success then return false; end if;
  select count(*) into failures from public.login_attempts a
  where a.email_hash = p_email_hash and not a.success
    and a.created_at > now() - make_interval(mins => p_lock_minutes)
    and a.created_at > coalesce((select max(s.created_at) from public.login_attempts s where s.email_hash = p_email_hash and s.success), '-infinity');
  return failures >= p_threshold;
end;
$$;
revoke all on function public.record_login_attempt(text, text, boolean, integer, integer) from public, anon, authenticated;
grant execute on function public.record_login_attempt(text, text, boolean, integer, integer) to service_role;
