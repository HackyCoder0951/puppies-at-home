-- B8 notifications: transactional outbox, templates (versioned), rules, message log and in-app notifications.
-- Events are written by triggers in the same transaction as the business change (rollback sends nothing).
create type public.message_channel as enum ('email', 'whatsapp');
create type public.outbox_status as enum ('pending', 'processing', 'done', 'failed');
create type public.message_status as enum ('queued', 'sent', 'delivered', 'read', 'failed', 'handed_off', 'skipped');

create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null check (key ~ '^[a-z0-9_]+$'),
  channel public.message_channel not null,
  locale text not null default 'en',
  version integer not null default 1,
  subject text,
  body text not null check (char_length(body) between 1 and 4000),
  is_active boolean not null default false,
  created_by uuid references public.profiles (user_id),
  created_at timestamptz not null default now(),
  unique (key, channel, locale, version)
);
create unique index message_templates_one_active on public.message_templates (key, channel, locale) where is_active;

create table public.notification_rules (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  channel text not null check (channel in ('email', 'whatsapp', 'in_app')),
  template_key text,
  recipient_type text not null check (recipient_type in ('customer', 'assignee', 'staff_role')),
  recipient_ref text,                                -- staff_role: 'super_admin', 'operator' or 'any'
  enabled boolean not null default true,
  delay_seconds integer not null default 0 check (delay_seconds >= 0),
  respect_quiet_hours boolean not null default false,
  in_app_title text,
  in_app_body text,
  created_at timestamptz not null default now(),
  check (channel = 'in_app' or template_key is not null),
  check (channel <> 'in_app' or in_app_title is not null)
);
create index notification_rules_event_idx on public.notification_rules (event) where enabled;

create table public.outbox (
  id bigint generated always as identity primary key,
  event text not null,
  entity text not null,
  entity_id text not null,
  payload jsonb not null default '{}',
  status public.outbox_status not null default 'pending',
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  locked_at timestamptz,
  last_error text,
  dedupe_key text not null unique,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create index outbox_due_idx on public.outbox (next_attempt_at) where status in ('pending', 'processing');

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id),
  order_id uuid references public.orders (id),
  channel public.message_channel not null,
  provider text not null,
  to_address text,
  template_key text,
  subject text,
  body text not null,
  status public.message_status not null default 'queued',
  provider_id text,
  error text,
  attempts integer not null default 0,
  sent_by uuid references public.profiles (user_id),
  outbox_id bigint references public.outbox (id),
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index messages_customer_idx on public.messages (customer_id, created_at desc);
create index messages_status_idx on public.messages (status, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  kind text not null default 'info' check (kind in ('info', 'action', 'alert')),
  title text not null,
  body text,
  link text,
  outbox_id bigint,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (user_id, outbox_id, title)
);
create index notifications_user_idx on public.notifications (user_id, read_at, created_at desc);

do $$
declare t text;
begin
  foreach t in array array['message_templates', 'notification_rules', 'outbox', 'messages', 'notifications'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
  foreach t in array array['message_templates', 'notification_rules'] loop
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function app_private.audit_row()', t, t);
  end loop;
end $$;
grant select on public.message_templates, public.notification_rules, public.messages, public.notifications to authenticated;
create policy templates_select on public.message_templates for select to authenticated using ((select app_private.has_permission('templates.read')));
create policy rules_select on public.notification_rules for select to authenticated using ((select app_private.has_permission('rules.manage')));
create policy messages_select on public.messages for select to authenticated using ((select app_private.has_permission('messages.read')));
create policy notifications_select on public.notifications for select to authenticated using (user_id = (select auth.uid()));

-- Event emission (same transaction as the change) ---------------------------------------------------------------------
create or replace function app_private.emit(p_event text, p_entity text, p_entity_id text, p_payload jsonb, p_dedupe text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.outbox (event, entity, entity_id, payload, dedupe_key) values (p_event, p_entity, p_entity_id, p_payload, p_dedupe) on conflict (dedupe_key) do nothing;
$$;

create or replace function app_private.emit_enquiry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform app_private.emit('enquiry.created', 'enquiry', new.id::text, jsonb_build_object('enquiryId', new.id, 'customerId', new.customer_id), 'enquiry.created:' || new.id);
  elsif new.assigned_to is not null and new.assigned_to is distinct from old.assigned_to then
    perform app_private.emit('enquiry.assigned', 'enquiry', new.id::text, jsonb_build_object('enquiryId', new.id, 'customerId', new.customer_id, 'assignedTo', new.assigned_to), 'enquiry.assigned:' || new.id || ':' || new.assigned_to || ':' || txid_current());
  end if;
  return new;
end;
$$;
create trigger enquiries_emit after insert or update on public.enquiries for each row execute function app_private.emit_enquiry();

create or replace function app_private.emit_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event text;
begin
  if new.status is not distinct from old.status then return new; end if;
  v_event := case new.status when 'confirmed' then 'order.confirmed' when 'cancelled' then 'order.cancelled' else 'order.status_changed' end;
  perform app_private.emit(v_event, 'order', new.id::text, jsonb_build_object('orderId', new.id, 'customerId', new.customer_id, 'from', old.status, 'to', new.status), v_event || ':' || new.id || ':' || new.status);
  return new;
end;
$$;
create trigger orders_emit after update on public.orders for each row execute function app_private.emit_order();

create or replace function app_private.emit_delivery_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  d record;
begin
  select dl.id, dl.order_id, o.customer_id into d from public.deliveries dl join public.orders o on o.id = dl.order_id where dl.id = new.delivery_id;
  perform app_private.emit('delivery.' || new.status, 'delivery', new.delivery_id::text, jsonb_build_object('deliveryId', new.delivery_id, 'orderId', d.order_id, 'customerId', d.customer_id, 'status', new.status, 'note', new.note, 'location', new.location), 'delivery.' || new.status || ':' || new.id);
  return new;
end;
$$;
create trigger delivery_events_emit after insert on public.delivery_events for each row execute function app_private.emit_delivery_event();

create or replace function app_private.emit_invoice()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status and new.status in ('issued', 'void') then
    perform app_private.emit('invoice.' || new.status, 'invoice', new.id::text, jsonb_build_object('invoiceId', new.id, 'orderId', new.order_id, 'customerId', new.customer_id), 'invoice.' || new.status || ':' || new.id);
  end if;
  return new;
end;
$$;
create trigger invoices_emit after update on public.invoices for each row execute function app_private.emit_invoice();

create or replace function app_private.emit_payment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer uuid;
begin
  if new.status = 'succeeded' then
    select customer_id into v_customer from public.orders where id = new.order_id;
    perform app_private.emit('payment.succeeded', 'payment', new.id::text, jsonb_build_object('paymentId', new.id, 'orderId', new.order_id, 'invoiceId', new.invoice_id, 'customerId', v_customer), 'payment.succeeded:' || new.id);
  end if;
  return new;
end;
$$;
create trigger payments_emit after insert on public.payments for each row execute function app_private.emit_payment();

create or replace function app_private.emit_refund()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order uuid;
  v_customer uuid;
begin
  select p.order_id, o.customer_id into v_order, v_customer from public.payments p join public.orders o on o.id = p.order_id where p.id = new.payment_id;
  if tg_op = 'INSERT' and new.status = 'requested' then
    perform app_private.emit('refund.requested', 'refund', new.id::text, jsonb_build_object('refundId', new.id, 'paymentId', new.payment_id, 'orderId', v_order, 'customerId', v_customer), 'refund.requested:' || new.id);
  elsif tg_op = 'UPDATE' and new.status = 'processed' and old.status is distinct from 'processed' then
    perform app_private.emit('payment.refunded', 'refund', new.id::text, jsonb_build_object('refundId', new.id, 'paymentId', new.payment_id, 'orderId', v_order, 'customerId', v_customer), 'payment.refunded:' || new.id);
  end if;
  return new;
end;
$$;
create trigger refunds_emit after insert or update on public.refunds for each row execute function app_private.emit_refund();

-- Templates -----------------------------------------------------------------------------------------------------------
create or replace function app_private.allowed_template_vars()
returns text[]
language sql
immutable
as $$ select array['customer.name', 'customer.first_name', 'order.number', 'order.status', 'order.total', 'order.balance', 'puppy.name', 'puppy.breed', 'delivery.method',
  'delivery.tracking_no', 'delivery.eta', 'delivery.carrier', 'delivery.status', 'delivery.note', 'delivery.location', 'invoice.number', 'invoice.total', 'invoice.due_date',
  'payment.amount', 'payment.method', 'payment.reference', 'refund.amount', 'business.name', 'business.phone', 'business.whatsapp_url', 'enquiry.message'] $$;

create or replace function app_private.check_template_vars(p_text text)
returns void
language plpgsql
immutable
as $$
declare
  v_var text;
begin
  for v_var in select m[1] from regexp_matches(coalesce(p_text, ''), '\{\{\s*([^}]*?)\s*\}\}', 'g') as m loop
    if not (v_var = any (app_private.allowed_template_vars())) then
      raise exception 'Unknown template variable {{%}}', v_var using errcode = '22023';
    end if;
  end loop;
end;
$$;

create or replace function public.save_template(p_key text, p_channel text, p_subject text, p_body text, p_locale text default 'en')
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version integer;
begin
  perform app_private.require_permission('templates.edit');
  if char_length(btrim(coalesce(p_body, ''))) = 0 then raise exception 'The message body is empty' using errcode = '22023'; end if;
  perform app_private.check_template_vars(p_subject);
  perform app_private.check_template_vars(p_body);
  select coalesce(max(version), 0) + 1 into v_version from public.message_templates where key = p_key and channel = p_channel::public.message_channel and locale = p_locale;
  if v_version = 1 then raise exception 'Unknown template' using errcode = '22023'; end if;
  update public.message_templates set is_active = false where key = p_key and channel = p_channel::public.message_channel and locale = p_locale and is_active;
  insert into public.message_templates (key, channel, locale, version, subject, body, is_active, created_by)
  values (p_key, p_channel::public.message_channel, p_locale, v_version, nullif(btrim(p_subject), ''), btrim(p_body), true, (select auth.uid()));
  return v_version;
end;
$$;

create or replace function public.activate_template_version(p_key text, p_channel text, p_version integer, p_locale text default 'en')
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_permission('templates.edit');
  if not exists (select 1 from public.message_templates where key = p_key and channel = p_channel::public.message_channel and locale = p_locale and version = p_version) then
    raise exception 'Unknown template version' using errcode = '22023';
  end if;
  update public.message_templates set is_active = false where key = p_key and channel = p_channel::public.message_channel and locale = p_locale and is_active;
  update public.message_templates set is_active = true where key = p_key and channel = p_channel::public.message_channel and locale = p_locale and version = p_version;
end;
$$;

create or replace function public.set_rule_enabled(p_rule uuid, p_enabled boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_permission('rules.manage');
  update public.notification_rules set enabled = p_enabled where id = p_rule;
  if not found then raise exception 'Unknown rule' using errcode = '22023'; end if;
end;
$$;

create or replace function public.mark_notifications_read(p_ids uuid[] default null)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if (select auth.uid()) is null then raise exception 'Requires a signed-in user' using errcode = '42501'; end if;
  update public.notifications set read_at = now() where user_id = (select auth.uid()) and read_at is null and (p_ids is null or id = any (p_ids));
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Manual message: queued as an outbox event so the same pipeline (consent, caps, log) handles it.
create or replace function public.queue_manual_message(p_customer uuid, p_order uuid, p_template text, p_channel text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id bigint;
begin
  perform app_private.require_permission('messages.send');
  perform app_private.require_permission('templates.use');
  if not exists (select 1 from public.message_templates where key = p_template and channel = p_channel::public.message_channel and is_active) then
    raise exception 'That template is not active for this channel' using errcode = '22023';
  end if;
  insert into public.outbox (event, entity, entity_id, payload, dedupe_key)
  values ('manual.message', 'customer', p_customer::text, jsonb_build_object('customerId', p_customer, 'orderId', p_order, 'templateKey', p_template, 'channel', p_channel, 'sentBy', (select auth.uid())), 'manual:' || gen_random_uuid())
  returning id into v_id;
  return v_id;
end;
$$;

-- Worker functions (service role only) ------------------------------------------------------------------------------------
create or replace function public.claim_outbox(p_limit integer default 20)
returns setof public.outbox
language sql
security definer
set search_path = ''
as $$
  update public.outbox o set status = 'processing', locked_at = now(), attempts = o.attempts + 1
  where o.id in (
    select id from public.outbox
    where (status = 'pending' and next_attempt_at <= now()) or (status = 'processing' and locked_at < now() - interval '5 minutes')
    order by id
    for update skip locked
    limit least(greatest(p_limit, 1), 100)
  )
  returning o.*;
$$;

create or replace function public.complete_outbox(p_id bigint)
returns void
language sql
security definer
set search_path = ''
as $$ update public.outbox set status = 'done', processed_at = now(), locked_at = null, last_error = null where id = p_id $$;

-- Retry with backoff (1, 5, 15, 60, 240 minutes); the fifth failure is final and alerts every active super admin.
create or replace function public.fail_outbox(p_id bigint, p_error text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.outbox;
begin
  select * into r from public.outbox where id = p_id for update;
  if not found then return 'missing'; end if;
  if r.attempts >= 5 then
    update public.outbox set status = 'failed', locked_at = null, last_error = left(p_error, 500), processed_at = now() where id = p_id;
    insert into public.notifications (user_id, kind, title, body, link, outbox_id)
    select p.user_id, 'alert', 'A notification could not be delivered', left(r.event || ': ' || coalesce(p_error, 'unknown error'), 300), '/admin/messages', p_id
    from public.profiles p where p.role = 'super_admin' and p.disabled_at is null
    on conflict do nothing;
    return 'failed';
  end if;
  update public.outbox set status = 'pending', locked_at = null, last_error = left(p_error, 500),
    next_attempt_at = now() + (case r.attempts when 1 then interval '1 minute' when 2 then interval '5 minutes' when 3 then interval '15 minutes' else interval '60 minutes' end)
  where id = p_id;
  return 'retry';
end;
$$;

create or replace function public.defer_outbox(p_id bigint, p_until timestamptz, p_reason text)
returns void
language sql
security definer
set search_path = ''
as $$ update public.outbox set status = 'pending', locked_at = null, attempts = greatest(attempts - 1, 0), next_attempt_at = p_until, last_error = left(p_reason, 200) where id = p_id $$;

create or replace function public.prune_outbox()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  delete from public.outbox where status = 'done' and processed_at < now() - interval '30 days';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.save_template(text, text, text, text, text), public.activate_template_version(text, text, integer, text), public.set_rule_enabled(uuid, boolean),
  public.mark_notifications_read(uuid[]), public.queue_manual_message(uuid, uuid, text, text) from public, anon;
grant execute on function public.save_template(text, text, text, text, text), public.activate_template_version(text, text, integer, text), public.set_rule_enabled(uuid, boolean),
  public.mark_notifications_read(uuid[]), public.queue_manual_message(uuid, uuid, text, text) to authenticated, service_role;
revoke all on function public.claim_outbox(integer), public.complete_outbox(bigint), public.fail_outbox(bigint, text), public.defer_outbox(bigint, timestamptz, text), public.prune_outbox() from public, anon, authenticated;
grant execute on function public.claim_outbox(integer), public.complete_outbox(bigint), public.fail_outbox(bigint, text), public.defer_outbox(bigint, timestamptz, text), public.prune_outbox() to service_role;
revoke all on function app_private.emit(text, text, text, jsonb, text), app_private.check_template_vars(text) from public, anon, authenticated;

-- Seed: templates and rules ---------------------------------------------------------------------------------------------
insert into public.message_templates (key, channel, subject, body, is_active) values
  ('enquiry_received', 'email', 'We received your enquiry', E'Hi {{customer.first_name}},\n\nThank you for contacting {{business.name}}. We have your message and will reply as soon as we can. For the quickest answer you can also message us on WhatsApp: {{business.whatsapp_url}}\n\n{{business.name}}', true),
  ('order_confirmed', 'email', 'Your order {{order.number}} is confirmed', E'Hi {{customer.first_name}},\n\nYour order {{order.number}} is confirmed. Total: {{order.total}}. We will keep you posted at every step.\n\n{{business.name}}', true),
  ('order_status_update', 'email', 'Update on your order {{order.number}}', E'Hi {{customer.first_name}},\n\nYour order {{order.number}} is now: {{order.status}}.\n\n{{business.name}}', true),
  ('order_cancelled', 'email', 'Your order {{order.number}} was cancelled', E'Hi {{customer.first_name}},\n\nYour order {{order.number}} has been cancelled. If this is a surprise, please contact us on {{business.phone}}.\n\n{{business.name}}', true),
  ('payment_receipt', 'email', 'Payment received for {{order.number}}', E'Hi {{customer.first_name}},\n\nWe received your payment of {{payment.amount}} ({{payment.method}}) for order {{order.number}}. Remaining balance: {{order.balance}}. Thank you!\n\n{{business.name}}', true),
  ('refund_issued', 'email', 'Your refund for {{order.number}}', E'Hi {{customer.first_name}},\n\nA refund of {{refund.amount}} for order {{order.number}} has been approved. It reaches you the way we agreed.\n\n{{business.name}}', true),
  ('invoice_issued', 'email', 'Invoice {{invoice.number}}', E'Hi {{customer.first_name}},\n\nYour invoice {{invoice.number}} for order {{order.number}} is ready. Total: {{invoice.total}}, due {{invoice.due_date}}. We will send the PDF copy on request.\n\n{{business.name}}', true),
  ('delivery_dispatched', 'email', 'Your puppy is on the way ({{order.number}})', E'Hi {{customer.first_name}},\n\nYour delivery ({{delivery.method}}) has been dispatched. Carrier: {{delivery.carrier}}. Tracking: {{delivery.tracking_no}}. Expected: {{delivery.eta}}.\n\n{{business.name}}', true),
  ('delivery_update', 'email', 'Delivery update for {{order.number}}', E'Hi {{customer.first_name}},\n\nDelivery status: {{delivery.status}}. {{delivery.location}} {{delivery.note}}\n\n{{business.name}}', true),
  ('delivery_delayed', 'email', 'A delay on your delivery ({{order.number}})', E'Hi {{customer.first_name}},\n\nYour delivery is delayed. {{delivery.note}} We are on it and will update you. Questions? {{business.whatsapp_url}}\n\n{{business.name}}', true),
  ('delivery_arrived', 'email', 'Your puppy has arrived ({{order.number}})', E'Hi {{customer.first_name}},\n\nGood news: your delivery status is {{delivery.status}}. Welcome home to your new family member! If you need anything, message us any time.\n\n{{business.name}}', true);
insert into public.message_templates (key, channel, body, is_active) values
  ('enquiry_received_wa', 'whatsapp', E'Hi {{customer.first_name}}, thanks for contacting {{business.name}}! We will reply shortly.', true),
  ('delivery_dispatched_wa', 'whatsapp', E'Hi {{customer.first_name}}, your order {{order.number}} has been dispatched. Carrier {{delivery.carrier}}, tracking {{delivery.tracking_no}}, expected {{delivery.eta}}.', true);

insert into public.notification_rules (event, channel, template_key, recipient_type, recipient_ref, enabled, in_app_title, in_app_body) values
  ('enquiry.created', 'email', 'enquiry_received', 'customer', null, true, null, null),
  ('enquiry.created', 'whatsapp', 'enquiry_received_wa', 'customer', null, false, null, null),
  ('enquiry.created', 'in_app', null, 'staff_role', 'any', true, 'New enquiry', '{{customer.name}} sent an enquiry. {{enquiry.message}}'),
  ('enquiry.assigned', 'in_app', null, 'assignee', null, true, 'Enquiry assigned to you', '{{customer.name}}''s enquiry is now yours.'),
  ('order.confirmed', 'email', 'order_confirmed', 'customer', null, true, null, null),
  ('order.status_changed', 'email', 'order_status_update', 'customer', null, true, null, null),
  ('order.cancelled', 'email', 'order_cancelled', 'customer', null, true, null, null),
  ('order.cancelled', 'in_app', null, 'staff_role', 'super_admin', true, 'Order cancelled', 'Order {{order.number}} was cancelled.'),
  ('payment.succeeded', 'email', 'payment_receipt', 'customer', null, true, null, null),
  ('payment.succeeded', 'in_app', null, 'staff_role', 'super_admin', true, 'Payment received', '{{payment.amount}} for order {{order.number}}.'),
  ('refund.requested', 'in_app', null, 'staff_role', 'super_admin', true, 'Refund needs approval', 'A refund was requested for order {{order.number}}.'),
  ('payment.refunded', 'email', 'refund_issued', 'customer', null, true, null, null),
  ('invoice.issued', 'email', 'invoice_issued', 'customer', null, true, null, null),
  ('delivery.dispatched', 'email', 'delivery_dispatched', 'customer', null, true, null, null),
  ('delivery.dispatched', 'whatsapp', 'delivery_dispatched_wa', 'customer', null, false, null, null),
  ('delivery.in_transit', 'email', 'delivery_update', 'customer', null, true, null, null),
  ('delivery.delayed', 'email', 'delivery_delayed', 'customer', null, true, null, null),
  ('delivery.delayed', 'in_app', null, 'staff_role', 'super_admin', true, 'Delivery delayed', 'Order {{order.number}}: {{delivery.note}}'),
  ('delivery.arrived', 'email', 'delivery_arrived', 'customer', null, true, null, null),
  ('delivery.delivered', 'email', 'delivery_arrived', 'customer', null, true, null, null);
