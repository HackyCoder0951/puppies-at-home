-- B7 billing: VAT rates, invoices, payments (manual ledger first, gateway-ready), refunds. Money is in minor units (fils).
-- VAT is added on top of item prices (owner decision); the rate is configurable and snapshotted on each order and line.
create type public.invoice_status as enum ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'void');
create type public.payment_method as enum ('card', 'bank_transfer', 'cash', 'card_machine', 'link', 'other');
create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'partially_refunded', 'refunded');
create type public.refund_status as enum ('requested', 'approved', 'processed', 'failed', 'rejected');

create table public.tax_rates (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  rate_bps integer not null check (rate_bps between 0 and 10000),   -- 500 = 5%
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index tax_rates_one_default on public.tax_rates ((true)) where is_default;
insert into public.tax_rates (name, rate_bps, is_default) values ('UAE VAT 5%', 500, true);

-- Orders carry the tax snapshot; balance now includes VAT.
alter table public.orders add column tax_rate_bps integer not null default 0 check (tax_rate_bps between 0 and 10000);
alter table public.orders add column tax_minor bigint not null default 0 check (tax_minor >= 0);
alter table public.orders drop column balance_minor;
alter table public.orders add column balance_minor bigint generated always as (total_minor + tax_minor - paid_minor) stored;
alter table public.orders drop constraint orders_check;
alter table public.orders add constraint orders_deposit_within_total check (deposit_minor <= total_minor + tax_minor);

create sequence public.invoice_number_seq;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text unique,                                              -- allocated when issued
  order_id uuid not null references public.orders (id),
  customer_id uuid not null references public.customers (id),
  status public.invoice_status not null default 'draft',
  currency char(3) not null default 'AED',
  subtotal_minor bigint not null default 0 check (subtotal_minor >= 0),
  tax_minor bigint not null default 0 check (tax_minor >= 0),
  total_minor bigint not null default 0 check (total_minor >= 0),
  paid_minor bigint not null default 0 check (paid_minor >= 0),
  issued_at timestamptz,
  due_at date,
  void_reason text,
  notes text,
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'draft') = (number is null)),                   -- numbers exist from issue on; draft has none
  check (status <> 'void' or void_reason is not null)
);
create index invoices_order_idx on public.invoices (order_id);
create index invoices_status_idx on public.invoices (status, due_at);

create table public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null check (char_length(description) between 2 and 200),
  quantity integer not null check (quantity between 1 and 99),
  unit_minor bigint not null check (unit_minor >= 0),
  tax_rate_bps integer not null default 0,
  tax_minor bigint not null default 0,
  sort_order integer not null default 0
);
create index invoice_lines_idx on public.invoice_lines (invoice_id, sort_order);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id),
  invoice_id uuid references public.invoices (id),
  gateway text not null default 'manual',
  gateway_ref text not null,
  method public.payment_method not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null default 'AED',
  status public.payment_status not null default 'succeeded',
  paid_at timestamptz not null default now(),
  recorded_by uuid references public.profiles (user_id),
  note text,
  raw jsonb,
  created_at timestamptz not null default now(),
  unique (gateway, gateway_ref)                                     -- idempotency anchor
);
create index payments_order_idx on public.payments (order_id);
create index payments_invoice_idx on public.payments (invoice_id) where invoice_id is not null;

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id),
  amount_minor bigint not null check (amount_minor > 0),
  reason text not null check (char_length(reason) between 3 and 500),
  status public.refund_status not null default 'requested',
  requested_by uuid references public.profiles (user_id),
  decided_by uuid references public.profiles (user_id),
  decision_note text,
  gateway_ref text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create index refunds_payment_idx on public.refunds (payment_id);
create index refunds_status_idx on public.refunds (status, created_at);

create trigger invoices_updated before update on public.invoices for each row execute function app_private.set_updated_at();
do $$
declare t text;
begin
  foreach t in array array['invoices', 'payments', 'refunds', 'tax_rates'] loop
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function app_private.audit_row()', t, t);
  end loop;
  foreach t in array array['tax_rates', 'invoices', 'invoice_lines', 'payments', 'refunds'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to authenticated', t);
  end loop;
end $$;
create policy tax_rates_select on public.tax_rates for select to authenticated using ((select app_private.is_active_staff()));
create policy invoices_select on public.invoices for select to authenticated using ((select app_private.has_permission('invoices.read')));
create policy invoice_lines_select on public.invoice_lines for select to authenticated using ((select app_private.has_permission('invoices.read')));
create policy payments_select on public.payments for select to authenticated using ((select app_private.has_permission('payments.read')));
create policy refunds_select on public.refunds for select to authenticated using ((select app_private.has_permission('payments.read')));

-- Tax helpers -------------------------------------------------------------------------------------------------------
create or replace function app_private.line_tax(p_quantity integer, p_unit bigint, p_bps integer)
returns bigint
language sql
immutable
as $$ select round(p_quantity::numeric * p_unit * p_bps / 10000)::bigint $$;

create or replace function app_private.default_tax_bps()
returns integer
language sql
stable
security definer
set search_path = ''
as $$ select coalesce((select rate_bps from public.tax_rates where is_default), 0) $$;

-- Orders: totals now include a tax snapshot --------------------------------------------------------------------------
create or replace function app_private.apply_order_tax(p_order uuid, p_bps integer)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tax bigint;
begin
  select coalesce(sum(app_private.line_tax(quantity, unit_minor, p_bps)), 0) into v_tax from public.order_items where order_id = p_order;
  update public.orders set tax_rate_bps = p_bps, tax_minor = v_tax where id = p_order;
  return v_tax;
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
  v_tax bigint;
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
  v_tax := app_private.apply_order_tax(v_id, app_private.default_tax_bps());
  if coalesce(p_deposit_minor, 0) < 0 or coalesce(p_deposit_minor, 0) > v_total + v_tax then
    raise exception 'The deposit must be between 0 and the total including VAT' using errcode = '22023';
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
  v_tax bigint;
  v_deposit bigint;
begin
  perform app_private.require_permission('orders.write');
  select status, deposit_minor into v_status, v_deposit from public.orders where id = p_order for update;
  if not found then raise exception 'Unknown order' using errcode = '22023'; end if;
  if v_status not in ('new', 'confirmed') then raise exception 'Items can only change before the deposit'; end if;
  if exists (select 1 from public.invoices where order_id = p_order and status <> 'void') then
    raise exception 'Void the order''s invoices before changing its items';
  end if;
  v_total := app_private.write_order_items(p_order, p_items);
  v_tax := app_private.apply_order_tax(p_order, app_private.default_tax_bps());
  v_deposit := coalesce(p_deposit_minor, v_deposit);
  if v_deposit < 0 or v_deposit > v_total + v_tax then raise exception 'The deposit must be between 0 and the total including VAT' using errcode = '22023'; end if;
  update public.orders set total_minor = v_total, deposit_minor = v_deposit where id = p_order;
end;
$$;

-- Money recomputation: one place derives paid amounts and statuses from the ledger -------------------------------------
create or replace function app_private.recompute_money(p_order uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_paid bigint;
  v_inv record;
  v_inv_paid bigint;
  v_new public.invoice_status;
  o record;
begin
  select coalesce(sum(p.amount_minor), 0) - coalesce((select sum(r.amount_minor) from public.refunds r join public.payments pp on pp.id = r.payment_id where pp.order_id = p_order and r.status = 'processed'), 0)
    into v_paid from public.payments p where p.order_id = p_order and p.status in ('succeeded', 'partially_refunded', 'refunded');
  update public.orders set paid_minor = greatest(v_paid, 0) where id = p_order;

  for v_inv in select id, status, total_minor, due_at from public.invoices where order_id = p_order and status <> 'draft' and status <> 'void' loop
    select coalesce(sum(p.amount_minor), 0) - coalesce((select sum(r.amount_minor) from public.refunds r join public.payments pp on pp.id = r.payment_id where pp.invoice_id = v_inv.id and r.status = 'processed'), 0)
      into v_inv_paid from public.payments p where p.invoice_id = v_inv.id and p.status in ('succeeded', 'partially_refunded', 'refunded');
    v_inv_paid := greatest(v_inv_paid, 0);
    v_new := case
      when v_inv_paid >= v_inv.total_minor then 'paid'
      when v_inv_paid > 0 then 'partially_paid'
      when v_inv.due_at is not null and v_inv.due_at < current_date then 'overdue'
      else 'issued' end;
    update public.invoices set paid_minor = v_inv_paid, status = v_new where id = v_inv.id;
  end loop;

  -- Deposit received moves a confirmed order forward.
  select status, deposit_minor, paid_minor into o from public.orders where id = p_order;
  if o.status = 'confirmed' and o.deposit_minor > 0 and o.paid_minor >= o.deposit_minor then
    perform set_config('app.reason', 'Deposit received', true);
    update public.orders set status = 'deposit_paid' where id = p_order;
  end if;
end;
$$;

-- Invoices -------------------------------------------------------------------------------------------------------------
create or replace function app_private.guard_invoice()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.status <> 'draft' then raise exception 'Issued invoices cannot be deleted'; end if;
    return old;
  end if;
  if old.status <> 'draft' then
    if new.subtotal_minor is distinct from old.subtotal_minor or new.tax_minor is distinct from old.tax_minor or new.total_minor is distinct from old.total_minor
       or new.number is distinct from old.number or new.order_id is distinct from old.order_id or new.customer_id is distinct from old.customer_id
       or new.issued_at is distinct from old.issued_at or new.currency is distinct from old.currency then
      raise exception 'An issued invoice cannot be changed';
    end if;
  end if;
  if new.status is distinct from old.status then
    if old.status = 'void' then raise exception 'A void invoice cannot change'; end if;
    if old.status = 'draft' and new.status not in ('issued', 'void') then raise exception 'Invalid invoice transition from draft to %', new.status; end if;
    if old.status <> 'draft' and new.status = 'draft' then raise exception 'An issued invoice cannot go back to draft'; end if;
    if new.status = 'void' and (new.paid_minor > 0 or old.status = 'paid') then raise exception 'A paid invoice cannot be voided (needs a credit note)'; end if;
  end if;
  return new;
end;
$$;
create trigger invoices_guard before update or delete on public.invoices for each row execute function app_private.guard_invoice();

create or replace function app_private.guard_invoice_lines()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invoice uuid := coalesce(new.invoice_id, old.invoice_id);
begin
  if not exists (select 1 from public.invoices where id = v_invoice and status = 'draft') then
    raise exception 'Only draft invoices have editable lines';
  end if;
  return coalesce(new, old);
end;
$$;
create trigger invoice_lines_guard before insert or update or delete on public.invoice_lines for each row execute function app_private.guard_invoice_lines();

create or replace function app_private.write_invoice_lines(p_invoice uuid, p_lines jsonb, p_bps integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_line jsonb;
  v_i integer := 0;
  v_sub bigint := 0;
  v_tax bigint := 0;
  v_line_tax bigint;
begin
  if jsonb_typeof(p_lines) is distinct from 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'An invoice needs at least one line' using errcode = '22023';
  end if;
  delete from public.invoice_lines where invoice_id = p_invoice;
  for v_line in select * from jsonb_array_elements(p_lines) loop
    v_line_tax := app_private.line_tax((v_line ->> 'quantity')::integer, (v_line ->> 'unitMinor')::bigint, p_bps);
    insert into public.invoice_lines (invoice_id, description, quantity, unit_minor, tax_rate_bps, tax_minor, sort_order)
    values (p_invoice, btrim(v_line ->> 'description'), (v_line ->> 'quantity')::integer, (v_line ->> 'unitMinor')::bigint, p_bps, v_line_tax, v_i);
    v_sub := v_sub + (v_line ->> 'quantity')::bigint * (v_line ->> 'unitMinor')::bigint;
    v_tax := v_tax + v_line_tax;
    v_i := v_i + 1;
  end loop;
  update public.invoices set subtotal_minor = v_sub, tax_minor = v_tax, total_minor = v_sub + v_tax where id = p_invoice;
exception when invalid_text_representation or not_null_violation or check_violation then
  raise exception 'Invalid invoice line' using errcode = '22023';
end;
$$;

-- Draft from the order's items and tax snapshot; staff may edit the lines until it is issued.
create or replace function public.create_invoice(p_order uuid, p_due date default null, p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  o record;
  v_id uuid := gen_random_uuid();
  v_lines jsonb;
begin
  perform app_private.require_permission('invoices.write');
  select id, customer_id, tax_rate_bps, status, currency into o from public.orders where id = p_order;
  if not found then raise exception 'Unknown order' using errcode = '22023'; end if;
  if o.status = 'cancelled' then raise exception 'A cancelled order cannot be invoiced'; end if;
  select jsonb_agg(jsonb_build_object('description', description, 'quantity', quantity, 'unitMinor', unit_minor) order by sort_order) into v_lines from public.order_items where order_id = p_order;
  insert into public.invoices (id, order_id, customer_id, currency, due_at, notes, created_by)
  values (v_id, p_order, o.customer_id, o.currency, p_due, nullif(btrim(p_notes), ''), (select auth.uid()));
  perform app_private.write_invoice_lines(v_id, v_lines, o.tax_rate_bps);
  return v_id;
end;
$$;

-- Lines always come from the order (one source of truth for what is owed); a draft can only change its due date and notes.
create or replace function public.update_invoice_draft(p_invoice uuid, p_due date, p_notes text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_permission('invoices.write');
  update public.invoices set due_at = p_due, notes = nullif(btrim(p_notes), '') where id = p_invoice and status = 'draft';
  if not found then raise exception 'Only draft invoices can be edited'; end if;
end;
$$;

create or replace function public.issue_invoice(p_invoice uuid, p_due date default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_number text := 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text, 6, '0');
  v_total bigint;
  v_order uuid;
begin
  perform app_private.require_permission('invoices.issue');
  select total_minor, order_id into v_total, v_order from public.invoices where id = p_invoice and status = 'draft' for update;
  if not found then raise exception 'Only a draft invoice can be issued'; end if;
  if v_total <= 0 then raise exception 'An invoice for nothing cannot be issued'; end if;
  update public.invoices set status = 'issued', number = v_number, issued_at = now(), due_at = coalesce(p_due, due_at, current_date + 14) where id = p_invoice;
  perform app_private.recompute_money(v_order);   -- picks up payments already recorded against the invoice's order
  return v_number;
end;
$$;

create or replace function public.void_invoice(p_invoice uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_permission('invoices.void');
  if char_length(btrim(coalesce(p_reason, ''))) < 3 then raise exception 'Voiding needs a reason'; end if;
  update public.invoices set status = 'void', void_reason = btrim(p_reason) where id = p_invoice;
  if not found then raise exception 'Unknown invoice' using errcode = '22023'; end if;
end;
$$;

-- Payments (manual ledger) -------------------------------------------------------------------------------------------
-- Idempotent on (gateway, reference): the same reference returns the existing row and changes nothing.
create or replace function public.record_manual_payment(p_order uuid, p_invoice uuid, p_reference text, p_method text, p_amount_minor bigint, p_note text default null, p_paid_at timestamptz default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  o record;
  v_ref text := btrim(coalesce(p_reference, ''));
begin
  perform app_private.require_permission('payments.record');
  if char_length(v_ref) < 6 or char_length(v_ref) > 100 then raise exception 'A payment reference of 6 to 100 characters is required' using errcode = '22023'; end if;
  select id into v_id from public.payments where gateway = 'manual' and gateway_ref = v_ref;
  if found then return jsonb_build_object('id', v_id, 'duplicate', true); end if;

  select id, status, total_minor, tax_minor, paid_minor into o from public.orders where id = p_order for update;
  if not found then raise exception 'Unknown order' using errcode = '22023'; end if;
  if o.status in ('cancelled', 'new') then raise exception 'Payments need a confirmed order'; end if;
  if p_invoice is not null and not exists (select 1 from public.invoices where id = p_invoice and order_id = p_order and status in ('issued', 'partially_paid', 'overdue')) then
    raise exception 'That invoice is not open for payment';
  end if;
  if coalesce(p_amount_minor, 0) <= 0 then raise exception 'The amount must be positive' using errcode = '22023'; end if;
  if p_amount_minor > o.total_minor + o.tax_minor - o.paid_minor then raise exception 'The payment is more than the balance'; end if;

  insert into public.payments (order_id, invoice_id, gateway, gateway_ref, method, amount_minor, status, paid_at, recorded_by, note)
  values (p_order, p_invoice, 'manual', v_ref, p_method::public.payment_method, p_amount_minor, 'succeeded', coalesce(p_paid_at, now()), (select auth.uid()), nullif(btrim(p_note), ''))
  returning id into v_id;
  perform app_private.recompute_money(p_order);
  return jsonb_build_object('id', v_id, 'duplicate', false);
exception when invalid_text_representation then
  raise exception 'Unknown payment method' using errcode = '22023';
end;
$$;

-- Refunds: operators request, super admins decide. Manual refunds are recorded when approved (money moves outside the system).
create or replace function public.request_refund(p_payment uuid, p_amount_minor bigint, p_reason text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_amount bigint;
  v_taken bigint;
  v_id uuid;
begin
  perform app_private.require_permission('payments.refund.request');
  select amount_minor into v_amount from public.payments where id = p_payment and status in ('succeeded', 'partially_refunded');
  if not found then raise exception 'That payment cannot be refunded'; end if;
  select coalesce(sum(amount_minor), 0) into v_taken from public.refunds where payment_id = p_payment and status in ('requested', 'approved', 'processed');
  if coalesce(p_amount_minor, 0) <= 0 or p_amount_minor > v_amount - v_taken then raise exception 'The refund is more than what is left of the payment'; end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 3 then raise exception 'A refund needs a reason' using errcode = '22023'; end if;
  insert into public.refunds (payment_id, amount_minor, reason, requested_by) values (p_payment, p_amount_minor, btrim(p_reason), (select auth.uid())) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.decide_refund(p_refund uuid, p_approve boolean, p_note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  v_paid_refunded bigint;
  v_amount bigint;
begin
  perform app_private.require_permission('payments.refund.approve');
  select * into r from public.refunds where id = p_refund and status = 'requested' for update;
  if not found then raise exception 'That refund is not waiting for a decision'; end if;
  if not p_approve then
    update public.refunds set status = 'rejected', decided_by = (select auth.uid()), decision_note = nullif(btrim(p_note), '') where id = p_refund;
    return;
  end if;
  update public.refunds set status = 'processed', decided_by = (select auth.uid()), decision_note = nullif(btrim(p_note), ''), processed_at = now() where id = p_refund;
  select amount_minor into v_amount from public.payments where id = r.payment_id;
  select coalesce(sum(amount_minor), 0) into v_paid_refunded from public.refunds where payment_id = r.payment_id and status = 'processed';
  update public.payments set status = case when v_paid_refunded >= v_amount then 'refunded'::public.payment_status else 'partially_refunded'::public.payment_status end where id = r.payment_id;
  perform app_private.recompute_money((select order_id from public.payments where id = r.payment_id));
end;
$$;

-- Daily job (called by cron with the service role): invoices past their due date.
create or replace function public.mark_overdue_invoices()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.invoices set status = 'overdue' where status in ('issued', 'partially_paid') and due_at < current_date;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Default tax rate (super admin only; existing orders keep their snapshot).
create or replace function public.set_default_tax_rate(p_name text, p_rate_bps integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_permission('settings.write');
  if p_rate_bps is null or p_rate_bps < 0 or p_rate_bps > 10000 then raise exception 'Invalid tax rate' using errcode = '22023'; end if;
  update public.tax_rates set is_default = false where is_default;
  insert into public.tax_rates (name, rate_bps, is_default) values (btrim(p_name), p_rate_bps, true);
end;
$$;

revoke all on function public.create_invoice(uuid, date, text), public.update_invoice_draft(uuid, date, text), public.issue_invoice(uuid, date), public.void_invoice(uuid, text),
  public.record_manual_payment(uuid, uuid, text, text, bigint, text, timestamptz), public.request_refund(uuid, bigint, text), public.decide_refund(uuid, boolean, text),
  public.mark_overdue_invoices(), public.set_default_tax_rate(text, integer) from public, anon;
grant execute on function public.create_invoice(uuid, date, text), public.update_invoice_draft(uuid, date, text), public.issue_invoice(uuid, date), public.void_invoice(uuid, text),
  public.record_manual_payment(uuid, uuid, text, text, bigint, text, timestamptz), public.request_refund(uuid, bigint, text), public.decide_refund(uuid, boolean, text),
  public.set_default_tax_rate(text, integer) to authenticated, service_role;
revoke all on function public.mark_overdue_invoices() from authenticated;
grant execute on function public.mark_overdue_invoices() to service_role;
revoke all on function app_private.apply_order_tax(uuid, integer), app_private.recompute_money(uuid), app_private.write_invoice_lines(uuid, jsonb, integer), app_private.default_tax_bps() from public, anon, authenticated;
