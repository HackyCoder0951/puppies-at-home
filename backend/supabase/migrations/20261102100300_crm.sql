-- B1 CRM: customers, enquiries, notes, consent records, data subject requests, and the public create_enquiry RPC.
create type public.enquiry_source as enum ('contact_letter', 'puppy_enquiry', 'whatsapp', 'manual');
create type public.enquiry_status as enum ('new', 'contacted', 'qualified', 'converted', 'closed', 'spam');
create type public.consent_purpose as enum ('enquiry_reply', 'marketing_email', 'whatsapp_updates', 'photo_publication');
create type public.dsr_type as enum ('access', 'rectification', 'erasure', 'restriction', 'portability', 'objection', 'withdrawal', 'grievance');
create type public.dsr_status as enum ('received', 'verifying', 'in_progress', 'completed', 'rejected', 'extended');

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone_e164 text check (phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  phone_display text,
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  area text,
  language text not null default 'en',
  notes text,
  tags text[] not null default '{}',
  notification_prefs jsonb not null default '{"email": true, "whatsapp": false}',
  whatsapp_opt_in_at timestamptz,
  whatsapp_opt_in_source text,
  whatsapp_opted_out_at timestamptz,
  source text not null default 'enquiry',
  restricted_at timestamptz,
  deleted_at timestamptz,
  anonymised_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_phone_idx on public.customers (phone_e164) where phone_e164 is not null;
create index customers_email_idx on public.customers (lower(email)) where email is not null;
create index customers_search_idx on public.customers using gin ((full_name || ' ' || coalesce(phone_e164, '') || ' ' || coalesce(email, '')) extensions.gin_trgm_ops);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id),
  puppy_id uuid references public.puppies (id),
  source public.enquiry_source not null,
  name text not null,
  phone text,
  email text,
  area text,
  message text,
  status public.enquiry_status not null default 'new',
  assigned_to uuid references public.profiles (user_id),
  ip_hash text,
  user_agent text,
  source_page text,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index enquiries_status_idx on public.enquiries (status, created_at desc);
create index enquiries_assignee_idx on public.enquiries (assigned_to, created_at desc) where status not in ('closed', 'spam');
create index enquiries_customer_idx on public.enquiries (customer_id, created_at desc);

create table public.enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries (id) on delete cascade,
  author_id uuid not null references public.profiles (user_id),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index enquiry_notes_idx on public.enquiry_notes (enquiry_id, created_at);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id),
  purpose public.consent_purpose not null,
  text_version text not null,
  given_at timestamptz not null default now(),
  channel text not null,
  source text,
  ip_hash text,
  withdrawn_at timestamptz,
  withdrawal_channel text,
  release_ref text
);
create index consent_customer_idx on public.consent_records (customer_id, purpose, given_at desc);

create table public.dsr_requests (
  id uuid primary key default gen_random_uuid(),
  subject_ref text not null,
  type public.dsr_type not null,
  received_at timestamptz not null default now(),
  due_at timestamptz not null default (now() + interval '30 days'),
  status public.dsr_status not null default 'received',
  handler_id uuid references public.profiles (user_id),
  identity_verified_at timestamptz,
  exceptions text,
  export_path text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index dsr_status_idx on public.dsr_requests (status, due_at);

do $$
declare t text;
begin
  foreach t in array array['customers','enquiries','dsr_requests'] loop
    execute format('create trigger %I_updated before update on public.%I for each row execute function app_private.set_updated_at()', t, t);
  end loop;
  foreach t in array array['customers','enquiries','enquiry_notes','consent_records','dsr_requests'] loop
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function app_private.audit_row()', t, t);
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

grant select, insert, update on public.customers, public.enquiries, public.dsr_requests to authenticated;
grant select, insert on public.enquiry_notes, public.consent_records to authenticated;
grant update (withdrawn_at, withdrawal_channel) on public.consent_records to authenticated;

create policy customers_select on public.customers for select to authenticated
  using ((select app_private.has_permission('customers.read')) and (deleted_at is null or (select app_private.current_app_role()) = 'super_admin'));
create policy customers_insert on public.customers for insert to authenticated with check ((select app_private.has_permission('customers.write')));
create policy customers_update on public.customers for update to authenticated
  using ((select app_private.has_permission('customers.write'))) with check ((select app_private.has_permission('customers.write')));

create policy enquiries_select on public.enquiries for select to authenticated using ((select app_private.has_permission('enquiries.read')));
create policy enquiries_insert on public.enquiries for insert to authenticated with check ((select app_private.has_permission('enquiries.write')));
create policy enquiries_update on public.enquiries for update to authenticated
  using ((select app_private.has_permission('enquiries.write'))) with check ((select app_private.has_permission('enquiries.write')));

create policy enquiry_notes_select on public.enquiry_notes for select to authenticated using ((select app_private.has_permission('enquiries.read')));
create policy enquiry_notes_insert on public.enquiry_notes for insert to authenticated
  with check ((select app_private.has_permission('enquiries.write')) and author_id = (select auth.uid()));

create policy consent_select on public.consent_records for select to authenticated using ((select app_private.has_permission('privacy.read')));
create policy consent_insert on public.consent_records for insert to authenticated with check ((select app_private.has_permission('privacy.manage')));
create policy consent_update on public.consent_records for update to authenticated
  using ((select app_private.has_permission('privacy.manage'))) with check ((select app_private.has_permission('privacy.manage')));

create policy dsr_select on public.dsr_requests for select to authenticated using ((select app_private.has_permission('privacy.read')));
create policy dsr_insert on public.dsr_requests for insert to authenticated
  with check ((select app_private.has_permission('privacy.manage')) or (select app_private.has_permission('privacy.intake')));
create policy dsr_update on public.dsr_requests for update to authenticated
  using ((select app_private.has_permission('privacy.manage'))) with check ((select app_private.has_permission('privacy.manage')));

-- Assignment needs its own permission.
create or replace function app_private.guard_enquiry_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and new.assigned_to is distinct from old.assigned_to and not app_private.has_permission('enquiries.assign') then
    raise exception 'Assigning an enquiry requires enquiries.assign' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger enquiries_assignment before update on public.enquiries for each row execute function app_private.guard_enquiry_assignment();

-- Public submission: validates, upserts the customer, stores the enquiry and the consent evidence, returns an opaque reference.
create or replace function public.create_enquiry(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(payload ->> 'name', ''));
  v_phone text := app_private.to_e164(payload ->> 'phone');
  v_email text := nullif(lower(btrim(coalesce(payload ->> 'email', ''))), '');
  v_area text := nullif(btrim(coalesce(payload ->> 'area', '')), '');
  v_message text := nullif(btrim(coalesce(payload ->> 'message', '')), '');
  v_source public.enquiry_source;
  v_slug text := nullif(btrim(coalesce(payload ->> 'puppy', '')), '');
  v_text_version text := coalesce(nullif(payload ->> 'consentTextVersion', ''), 'v1');
  v_page text := nullif(left(coalesce(payload ->> 'sourcePage', ''), 200), '');
  v_ip text := nullif(payload ->> 'ipHash', '');
  v_ua text := nullif(left(coalesce(payload ->> 'userAgent', ''), 300), '');
  v_puppy uuid;
  v_customer uuid;
  v_enquiry uuid;
begin
  if char_length(v_name) < 2 or char_length(v_name) > 80 then
    raise exception 'invalid name' using errcode = '22023';
  end if;
  if v_phone is null then
    raise exception 'invalid phone' using errcode = '22023';
  end if;
  if v_email is not null and (char_length(v_email) > 254 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') then
    raise exception 'invalid email' using errcode = '22023';
  end if;
  if v_area is not null and char_length(v_area) > 80 then
    raise exception 'invalid area' using errcode = '22023';
  end if;
  if v_message is not null and char_length(v_message) > 2000 then
    raise exception 'invalid message' using errcode = '22023';
  end if;
  v_source := case payload ->> 'source' when 'puppy' then 'puppy_enquiry' when 'contact' then 'contact_letter' else null end;
  if v_source is null then
    raise exception 'invalid source' using errcode = '22023';
  end if;

  if v_slug is not null then
    select p.id into v_puppy from public.puppies p where p.slug = v_slug and p.deleted_at is null limit 1;
  end if;

  select c.id into v_customer from public.customers c
  where c.deleted_at is null and c.anonymised_at is null and (c.phone_e164 = v_phone or (v_email is not null and lower(c.email) = v_email))
  order by c.created_at limit 1;
  if v_customer is null then
    insert into public.customers (full_name, phone_e164, phone_display, email, area, source)
    values (v_name, v_phone, payload ->> 'phone', v_email, v_area, 'enquiry') returning id into v_customer;
  end if;

  insert into public.enquiries (customer_id, puppy_id, source, name, phone, email, area, message, ip_hash, user_agent, source_page)
  values (v_customer, v_puppy, v_source, v_name, v_phone, v_email, v_area, v_message, v_ip, v_ua, v_page)
  returning id into v_enquiry;

  insert into public.consent_records (customer_id, purpose, text_version, channel, source, ip_hash)
  values (v_customer, 'enquiry_reply', v_text_version, 'web_form', v_page, v_ip);
  if coalesce((payload ->> 'marketing')::boolean, false) and v_email is not null then
    insert into public.consent_records (customer_id, purpose, text_version, channel, source, ip_hash)
    values (v_customer, 'marketing_email', v_text_version, 'web_form', v_page, v_ip);
  end if;
  if coalesce((payload ->> 'whatsappUpdates')::boolean, false) then
    insert into public.consent_records (customer_id, purpose, text_version, channel, source, ip_hash)
    values (v_customer, 'whatsapp_updates', v_text_version, 'web_form', v_page, v_ip);
    update public.customers set whatsapp_opt_in_at = now(), whatsapp_opt_in_source = v_page where id = v_customer and whatsapp_opt_in_at is null;
  end if;

  return jsonb_build_object('id', v_enquiry);
end;
$$;
revoke all on function public.create_enquiry(jsonb) from public;
grant execute on function public.create_enquiry(jsonb) to anon, authenticated, service_role;
