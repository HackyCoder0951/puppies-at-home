-- B6 commerce: orders, items, timeline, deliveries and their events. Writes go through RPCs that check permissions;
-- status moves are validated by triggers so no path (RPC, SQL console, service role) can skip the state machine.
create type public.order_status as enum ('new', 'confirmed', 'deposit_paid', 'preparing', 'in_transit', 'delivered', 'completed', 'cancelled');
create type public.order_type as enum ('local', 'imported');
create type public.delivery_method as enum ('showroom_pickup', 'dubai_delivery', 'international_cargo');
create type public.delivery_status as enum ('scheduled', 'packed', 'dispatched', 'in_transit', 'arrived', 'delivered', 'delayed', 'failed');

create sequence public.order_number_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  customer_id uuid not null references public.customers (id),
  puppy_id uuid references public.puppies (id),
  enquiry_id uuid references public.enquiries (id),
  type public.order_type not null,
  status public.order_status not null default 'new',
  currency char(3) not null default 'AED',
  total_minor bigint not null default 0 check (total_minor >= 0),
  deposit_minor bigint not null default 0 check (deposit_minor >= 0),
  paid_minor bigint not null default 0 check (paid_minor >= 0),   -- maintained by record_payment (B7), never by clients
  balance_minor bigint generated always as (total_minor - paid_minor) stored,
  cancel_reason text,
  notes text,
  assigned_to uuid references public.profiles (user_id),
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (deposit_minor <= total_minor)
);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_customer_idx on public.orders (customer_id, created_at desc);
create unique index orders_one_open_per_puppy on public.orders (puppy_id) where puppy_id is not null and status not in ('cancelled', 'completed');

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  description text not null check (char_length(description) between 2 and 200),
  quantity integer not null check (quantity between 1 and 99),
  unit_minor bigint not null check (unit_minor >= 0),
  sort_order integer not null default 0
);
create index order_items_idx on public.order_items (order_id, sort_order);

create table public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  reason text,
  actor_id uuid,
  created_at timestamptz not null default now()
);
create index order_events_idx on public.order_events (order_id, id);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id),
  method public.delivery_method not null,
  carrier text,
  tracking_no text,
  address jsonb,
  eta date,
  status public.delivery_status not null default 'scheduled',
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index deliveries_order_idx on public.deliveries (order_id);
create index deliveries_status_idx on public.deliveries (status, eta);

create table public.delivery_events (
  id bigint generated always as identity primary key,
  delivery_id uuid not null references public.deliveries (id) on delete cascade,
  status public.delivery_status not null,
  note text,
  location text,
  actor_id uuid,
  occurred_at timestamptz not null default now()
);
create index delivery_events_idx on public.delivery_events (delivery_id, id);

create trigger orders_updated before update on public.orders for each row execute function app_private.set_updated_at();
create trigger deliveries_updated before update on public.deliveries for each row execute function app_private.set_updated_at();
create trigger orders_audit after insert or update or delete on public.orders for each row execute function app_private.audit_row();
create trigger deliveries_audit after insert or update or delete on public.deliveries for each row execute function app_private.audit_row();

-- Clients read; nothing is written directly (RPCs below are the only write path).
do $$
declare t text;
begin
  foreach t in array array['orders', 'order_items', 'order_events', 'deliveries', 'delivery_events'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to authenticated', t);
  end loop;
end $$;
create policy orders_select on public.orders for select to authenticated using ((select app_private.has_permission('orders.read')));
create policy order_items_select on public.order_items for select to authenticated using ((select app_private.has_permission('orders.read')));
create policy order_events_select on public.order_events for select to authenticated using ((select app_private.has_permission('orders.read')));
create policy deliveries_select on public.deliveries for select to authenticated using ((select app_private.has_permission('deliveries.read')));
create policy delivery_events_select on public.delivery_events for select to authenticated using ((select app_private.has_permission('deliveries.read')));

create or replace function app_private.require_permission(p_permission text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not app_private.has_permission(p_permission) then
    raise exception 'Requires %', p_permission using errcode = '42501';
  end if;
end;
$$;
grant execute on function app_private.require_permission(text) to authenticated, service_role;

-- State machines --------------------------------------------------------------------------------------------------
create or replace function app_private.order_transition_ok(p_from public.order_status, p_to public.order_status, p_type public.order_type)
returns boolean
language sql
immutable
as $$
  select case p_from
    when 'new' then p_to in ('confirmed', 'cancelled')
    when 'confirmed' then p_to in ('deposit_paid', 'cancelled')
    when 'deposit_paid' then p_to in ('preparing', 'cancelled') or (p_type = 'local' and p_to = 'delivered')
    when 'preparing' then p_to in ('in_transit', 'cancelled') or (p_type = 'local' and p_to = 'delivered')
    when 'in_transit' then p_to = 'delivered'
    when 'delivered' then p_to = 'completed'
    else false
  end;
$$;

create or replace function app_private.guard_order_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reason text := nullif(btrim(coalesce(current_setting('app.reason', true), '')), '');
begin
  if new.status is not distinct from old.status then return new; end if;
  if not app_private.order_transition_ok(old.status, new.status, new.type) then
    raise exception 'Invalid order transition from % to %', old.status, new.status;
  end if;
  if new.status = 'cancelled' then
    if v_reason is null or char_length(v_reason) < 3 then
      raise exception 'Cancelling requires a reason';
    end if;
    if old.status = 'deposit_paid' and (select auth.uid()) is not null and app_private.current_app_role() is distinct from 'super_admin' then
      raise exception 'Cancelling after the deposit needs a super admin (refund decision)' using errcode = '42501';
    end if;
    new.cancel_reason := v_reason;
  end if;
  return new;
end;
$$;
create trigger orders_status_guard before update on public.orders for each row execute function app_private.guard_order_status();

create or replace function app_private.after_order_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_events (order_id, from_status, to_status, actor_id) values (new.id, null, new.status, (select auth.uid()));
    return new;
  end if;
  if new.status is not distinct from old.status then return new; end if;
  insert into public.order_events (order_id, from_status, to_status, reason, actor_id)
  values (new.id, old.status, new.status, nullif(btrim(coalesce(current_setting('app.reason', true), '')), ''), (select auth.uid()));
  if new.puppy_id is not null then
    if new.status = 'cancelled' then
      update public.puppies set status = 'available' where id = new.puppy_id and status = 'reserved';
    elsif new.status = 'delivered' then
      update public.puppies set status = 'gone_home', gone_home_source = coalesce(gone_home_source, 'TeddyPups'), gone_home_at = coalesce(gone_home_at, now()) where id = new.puppy_id and status <> 'gone_home';
    end if;
  end if;
  return new;
end;
$$;
create trigger orders_after_status after insert or update on public.orders for each row execute function app_private.after_order_status();

create or replace function app_private.delivery_transition_ok(p_from public.delivery_status, p_to public.delivery_status)
returns boolean
language sql
immutable
as $$
  select case p_from
    when 'scheduled' then p_to in ('packed', 'delayed', 'failed')
    when 'packed' then p_to in ('dispatched', 'delayed', 'failed')
    when 'dispatched' then p_to in ('in_transit', 'delayed', 'failed')
    when 'in_transit' then p_to in ('arrived', 'delayed', 'failed')
    when 'arrived' then p_to in ('delivered', 'delayed', 'failed')
    when 'delayed' then p_to in ('packed', 'dispatched', 'in_transit', 'arrived', 'failed')
    else false      -- delivered and failed are terminal
  end;
$$;

create or replace function app_private.guard_delivery_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is not distinct from old.status then return new; end if;
  if not app_private.delivery_transition_ok(old.status, new.status) then
    raise exception 'Invalid delivery transition from % to %', old.status, new.status;
  end if;
  if new.status = 'failed' and char_length(btrim(coalesce(current_setting('app.reason', true), ''))) < 3 then
    raise exception 'A failed delivery needs a note';
  end if;
  if new.status = 'delivered' then new.delivered_at := now(); end if;
  return new;
end;
$$;
create trigger deliveries_status_guard before update on public.deliveries for each row execute function app_private.guard_delivery_status();

create or replace function app_private.after_delivery_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.status is not distinct from old.status then return new; end if;
  insert into public.delivery_events (delivery_id, status, note, location, actor_id)
  values (new.id, new.status, nullif(btrim(coalesce(current_setting('app.reason', true), '')), ''), nullif(btrim(coalesce(current_setting('app.location', true), '')), ''), (select auth.uid()));
  return new;
end;
$$;
create trigger deliveries_after_status after insert or update on public.deliveries for each row execute function app_private.after_delivery_status();

-- RPCs ------------------------------------------------------------------------------------------------------------
create or replace function app_private.write_order_items(p_order uuid, p_items jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_total bigint := 0;
  v_i integer := 0;
begin
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'An order needs at least one item' using errcode = '22023';
  end if;
  delete from public.order_items where order_id = p_order;
  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into public.order_items (order_id, description, quantity, unit_minor, sort_order)
    values (p_order, btrim(v_item ->> 'description'), (v_item ->> 'quantity')::integer, (v_item ->> 'unitMinor')::bigint, v_i);
    v_total := v_total + (v_item ->> 'quantity')::bigint * (v_item ->> 'unitMinor')::bigint;
    v_i := v_i + 1;
  end loop;
  return v_total;
exception when invalid_text_representation or not_null_violation or check_violation then
  raise exception 'Invalid order item' using errcode = '22023';
end;
$$;

create or replace function public.create_order(p_customer uuid, p_puppy uuid, p_type text, p_items jsonb, p_deposit_minor bigint default 0, p_notes text default null, p_enquiry uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_number text := 'TP-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
  v_total bigint;
begin
  perform app_private.require_permission('orders.write');
  if p_type not in ('local', 'imported') then raise exception 'Invalid order type' using errcode = '22023'; end if;
  if not exists (select 1 from public.customers where id = p_customer and deleted_at is null and anonymised_at is null) then
    raise exception 'Unknown customer' using errcode = '22023';
  end if;
  if p_puppy is not null then
    update public.puppies set status = 'reserved' where id = p_puppy and status = 'available' and deleted_at is null;
    if not found then raise exception 'That puppy is not available'; end if;
  end if;
  insert into public.orders (id, number, customer_id, puppy_id, enquiry_id, type, deposit_minor, notes, created_by, total_minor)
  values (v_id, v_number, p_customer, p_puppy, p_enquiry, p_type::public.order_type, 0, nullif(btrim(p_notes), ''), (select auth.uid()), 0);
  v_total := app_private.write_order_items(v_id, p_items);
  if coalesce(p_deposit_minor, 0) < 0 or coalesce(p_deposit_minor, 0) > v_total then
    raise exception 'The deposit must be between 0 and the total' using errcode = '22023';
  end if;
  update public.orders set total_minor = v_total, deposit_minor = coalesce(p_deposit_minor, 0) where id = v_id;
  if p_enquiry is not null then
    update public.enquiries set status = 'converted', closed_at = now() where id = p_enquiry and status in ('new', 'contacted', 'qualified');
  end if;
  return jsonb_build_object('id', v_id, 'number', v_number);
end;
$$;

create or replace function public.set_order_items(p_order uuid, p_items jsonb, p_deposit_minor bigint default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status public.order_status;
  v_total bigint;
  v_deposit bigint;
begin
  perform app_private.require_permission('orders.write');
  select status, deposit_minor into v_status, v_deposit from public.orders where id = p_order for update;
  if not found then raise exception 'Unknown order' using errcode = '22023'; end if;
  if v_status not in ('new', 'confirmed') then raise exception 'Items can only change before the deposit'; end if;
  v_total := app_private.write_order_items(p_order, p_items);
  v_deposit := coalesce(p_deposit_minor, v_deposit);
  if v_deposit < 0 or v_deposit > v_total then raise exception 'The deposit must be between 0 and the total' using errcode = '22023'; end if;
  update public.orders set total_minor = v_total, deposit_minor = v_deposit where id = p_order;
end;
$$;

create or replace function public.update_order(p_order uuid, p_notes text, p_assigned_to uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_permission('orders.write');
  update public.orders set notes = nullif(btrim(p_notes), ''), assigned_to = p_assigned_to where id = p_order;
  if not found then raise exception 'Unknown order' using errcode = '22023'; end if;
end;
$$;

create or replace function public.transition_order(p_order uuid, p_to text, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_permission(case when p_to = 'cancelled' then 'orders.cancel' else 'orders.write' end);
  perform set_config('app.reason', coalesce(p_reason, ''), true);
  update public.orders set status = p_to::public.order_status where id = p_order;
  if not found then raise exception 'Unknown order' using errcode = '22023'; end if;
exception when invalid_text_representation then
  raise exception 'Unknown order status' using errcode = '22023';
end;
$$;

create or replace function public.create_delivery(p_order uuid, p_method text, p_carrier text default null, p_tracking text default null, p_address jsonb default null, p_eta date default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  perform app_private.require_permission('deliveries.write');
  if not exists (select 1 from public.orders where id = p_order and status not in ('cancelled', 'completed')) then
    raise exception 'The order is not open' using errcode = '22023';
  end if;
  insert into public.deliveries (order_id, method, carrier, tracking_no, address, eta)
  values (p_order, p_method::public.delivery_method, nullif(btrim(p_carrier), ''), nullif(btrim(p_tracking), ''), p_address, p_eta)
  returning id into v_id;
  return v_id;
exception when invalid_text_representation then
  raise exception 'Unknown delivery method' using errcode = '22023';
end;
$$;

create or replace function public.update_delivery(p_delivery uuid, p_carrier text, p_tracking text, p_address jsonb, p_eta date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_permission('deliveries.write');
  update public.deliveries set carrier = nullif(btrim(p_carrier), ''), tracking_no = nullif(btrim(p_tracking), ''), address = p_address, eta = p_eta where id = p_delivery;
  if not found then raise exception 'Unknown delivery' using errcode = '22023'; end if;
end;
$$;

create or replace function public.transition_delivery(p_delivery uuid, p_to text, p_note text default null, p_location text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_permission('deliveries.write');
  perform set_config('app.reason', coalesce(p_note, ''), true);
  perform set_config('app.location', coalesce(p_location, ''), true);
  update public.deliveries set status = p_to::public.delivery_status where id = p_delivery;
  if not found then raise exception 'Unknown delivery' using errcode = '22023'; end if;
exception when invalid_text_representation then
  raise exception 'Unknown delivery status' using errcode = '22023';
end;
$$;

revoke all on function public.create_order(uuid, uuid, text, jsonb, bigint, text, uuid), public.set_order_items(uuid, jsonb, bigint), public.update_order(uuid, text, uuid),
  public.transition_order(uuid, text, text), public.create_delivery(uuid, text, text, text, jsonb, date), public.update_delivery(uuid, text, text, jsonb, date),
  public.transition_delivery(uuid, text, text, text) from public, anon;
grant execute on function public.create_order(uuid, uuid, text, jsonb, bigint, text, uuid), public.set_order_items(uuid, jsonb, bigint), public.update_order(uuid, text, uuid),
  public.transition_order(uuid, text, text), public.create_delivery(uuid, text, text, text, jsonb, date), public.update_delivery(uuid, text, text, jsonb, date),
  public.transition_delivery(uuid, text, text, text) to authenticated, service_role;
revoke all on function app_private.write_order_items(uuid, jsonb) from public, anon, authenticated;
