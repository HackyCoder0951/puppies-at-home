-- B9 gateway payments: pending payments for hosted checkout links, idempotent settlement from verified webhooks,
-- and gateway refunds with a two-step approve then complete. Card data never enters the system (hosted checkout only).
create or replace function app_private.is_service()
returns boolean
language sql
stable
as $$ select coalesce((select auth.role()), '') = 'service_role' $$;

-- Staff start a hosted payment: a pending row anchored on the gateway reference (checkout session id).
create or replace function public.start_gateway_payment(p_order uuid, p_invoice uuid, p_gateway text, p_ref text, p_amount_minor bigint, p_url text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  o record;
begin
  perform app_private.require_permission('payments.record');
  if p_gateway = 'manual' or char_length(coalesce(p_ref, '')) < 6 then raise exception 'A gateway and reference are required' using errcode = '22023'; end if;
  select id into v_id from public.payments where gateway = p_gateway and gateway_ref = p_ref;
  if found then return v_id; end if;
  select id, status, total_minor, tax_minor, paid_minor, currency into o from public.orders where id = p_order for update;
  if not found or o.status in ('new', 'cancelled') then raise exception 'Payments need a confirmed order'; end if;
  if p_invoice is not null and not exists (select 1 from public.invoices where id = p_invoice and order_id = p_order and status in ('issued', 'partially_paid', 'overdue')) then
    raise exception 'That invoice is not open for payment';
  end if;
  if p_amount_minor <= 0 or p_amount_minor > o.total_minor + o.tax_minor - o.paid_minor then raise exception 'The payment is more than the balance'; end if;
  insert into public.payments (order_id, invoice_id, gateway, gateway_ref, method, amount_minor, currency, status, recorded_by, raw)
  values (p_order, p_invoice, p_gateway, p_ref, 'link', p_amount_minor, o.currency, 'pending', (select auth.uid()), jsonb_build_object('url', p_url))
  returning id into v_id;
  return v_id;
end;
$$;

-- Webhook settlement (service role only). Returns what happened so the handler can log it; replays change nothing.
create or replace function public.settle_gateway_payment(p_gateway text, p_ref text, p_event_id text, p_amount_minor bigint, p_currency text, p_paid_at timestamptz, p_raw jsonb default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  p record;
begin
  if not app_private.is_service() then raise exception 'Service role only' using errcode = '42501'; end if;
  insert into public.webhook_events (gateway, event_id) values (p_gateway, p_event_id) on conflict do nothing;
  if not found and exists (select 1 from public.webhook_events where gateway = p_gateway and event_id = p_event_id and processed_at is not null) then return 'duplicate_event'; end if;

  select * into p from public.payments where gateway = p_gateway and gateway_ref = p_ref for update;
  if not found then
    update public.webhook_events set processed_at = now() where gateway = p_gateway and event_id = p_event_id;
    return 'unknown_payment';
  end if;
  if p.status in ('succeeded', 'partially_refunded', 'refunded') then
    update public.webhook_events set processed_at = now() where gateway = p_gateway and event_id = p_event_id;
    return 'already_settled';
  end if;
  if p.amount_minor <> p_amount_minor or upper(p.currency) <> upper(p_currency) then
    -- Money moved but does not match what we asked for: do not guess. Leave the payment pending and alert super admins.
    insert into public.notifications (user_id, kind, title, body, link)
    select pr.user_id, 'alert', 'Payment amount mismatch', 'Gateway ' || p_gateway || ' reference ' || p_ref || ': expected ' || p.amount_minor || ' ' || p.currency || ', received ' || p_amount_minor || ' ' || upper(p_currency) || '.', '/admin/payments'
    from public.profiles pr where pr.role = 'super_admin' and pr.disabled_at is null;
    update public.webhook_events set processed_at = now() where gateway = p_gateway and event_id = p_event_id;
    return 'amount_mismatch';
  end if;
  update public.payments set status = 'succeeded', paid_at = coalesce(p_paid_at, now()), raw = coalesce(p_raw, raw) where id = p.id;
  perform app_private.recompute_money(p.order_id);
  update public.webhook_events set processed_at = now() where gateway = p_gateway and event_id = p_event_id;
  return 'settled';
end;
$$;

create or replace function public.fail_gateway_payment(p_gateway text, p_ref text, p_event_id text, p_reason text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  p record;
begin
  if not app_private.is_service() then raise exception 'Service role only' using errcode = '42501'; end if;
  insert into public.webhook_events (gateway, event_id) values (p_gateway, p_event_id) on conflict do nothing;
  if not found and exists (select 1 from public.webhook_events where gateway = p_gateway and event_id = p_event_id and processed_at is not null) then return 'duplicate_event'; end if;
  select * into p from public.payments where gateway = p_gateway and gateway_ref = p_ref for update;
  if found and p.status = 'pending' then
    update public.payments set status = 'failed', note = left(coalesce(p_reason, 'payment failed'), 300) where id = p.id;
  end if;
  update public.webhook_events set processed_at = now() where gateway = p_gateway and event_id = p_event_id;
  return case when found then 'failed' else 'unknown_payment' end;
end;
$$;

-- A payment that settles later (hosted checkout) must raise the same receipt event as a manual one.
create or replace function app_private.emit_payment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer uuid;
begin
  if new.status = 'succeeded' and (tg_op = 'INSERT' or old.status is distinct from 'succeeded') then
    select customer_id into v_customer from public.orders where id = new.order_id;
    perform app_private.emit('payment.succeeded', 'payment', new.id::text, jsonb_build_object('paymentId', new.id, 'orderId', new.order_id, 'invoiceId', new.invoice_id, 'customerId', v_customer), 'payment.succeeded:' || new.id);
  end if;
  return new;
end;
$$;
drop trigger payments_emit on public.payments;
create trigger payments_emit after insert or update on public.payments for each row execute function app_private.emit_payment();

-- Failed payments alert staff (the customer may retry through a new link).
create or replace function app_private.emit_payment_failed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer uuid;
begin
  if new.status = 'failed' and old.status is distinct from 'failed' then
    select customer_id into v_customer from public.orders where id = new.order_id;
    perform app_private.emit('payment.failed', 'payment', new.id::text, jsonb_build_object('paymentId', new.id, 'orderId', new.order_id, 'invoiceId', new.invoice_id, 'customerId', v_customer), 'payment.failed:' || new.id);
  end if;
  return new;
end;
$$;
create trigger payments_emit_failed after update on public.payments for each row execute function app_private.emit_payment_failed();

-- Refunds: shared completion, manual refunds finish on approval, gateway refunds wait for the gateway call.
create or replace function app_private.finish_refund(p_refund uuid, p_gateway_ref text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  v_amount bigint;
  v_refunded bigint;
begin
  select * into r from public.refunds where id = p_refund for update;
  update public.refunds set status = 'processed', processed_at = now(), gateway_ref = coalesce(p_gateway_ref, gateway_ref) where id = p_refund;
  select amount_minor into v_amount from public.payments where id = r.payment_id;
  select coalesce(sum(amount_minor), 0) into v_refunded from public.refunds where payment_id = r.payment_id and status = 'processed';
  update public.payments set status = case when v_refunded >= v_amount then 'refunded'::public.payment_status else 'partially_refunded'::public.payment_status end where id = r.payment_id;
  perform app_private.recompute_money((select order_id from public.payments where id = r.payment_id));
end;
$$;

drop function public.decide_refund(uuid, boolean, text);
create function public.decide_refund(p_refund uuid, p_approve boolean, p_note text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  v_gateway text;
begin
  perform app_private.require_permission('payments.refund.approve');
  select * into r from public.refunds where id = p_refund and status = 'requested' for update;
  if not found then raise exception 'That refund is not waiting for a decision'; end if;
  if not p_approve then
    update public.refunds set status = 'rejected', decided_by = (select auth.uid()), decision_note = nullif(btrim(p_note), '') where id = p_refund;
    return 'rejected';
  end if;
  select gateway into v_gateway from public.payments where id = r.payment_id;
  update public.refunds set decided_by = (select auth.uid()), decision_note = nullif(btrim(p_note), ''), status = case when v_gateway = 'manual' then 'processed'::public.refund_status else 'approved'::public.refund_status end where id = p_refund;
  if v_gateway = 'manual' then
    perform app_private.finish_refund(p_refund, null);
    return 'processed';
  end if;
  return 'approved';
end;
$$;

-- The app calls the gateway after approval, then records the result (approver session, or the webhook's service role).
create or replace function public.complete_gateway_refund(p_refund uuid, p_gateway_ref text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app_private.is_service() then perform app_private.require_permission('payments.refund.approve'); end if;
  if not exists (select 1 from public.refunds where id = p_refund and status = 'approved') then raise exception 'That refund is not approved'; end if;
  perform app_private.finish_refund(p_refund, p_gateway_ref);
end;
$$;

create or replace function public.fail_gateway_refund(p_refund uuid, p_error text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app_private.is_service() then perform app_private.require_permission('payments.refund.approve'); end if;
  update public.refunds set status = 'failed', decision_note = left(coalesce(p_error, 'gateway error'), 300) where id = p_refund and status = 'approved';
end;
$$;

-- Everything the app needs to call the gateway for an approved refund.
create or replace function public.refund_context(p_refund uuid)
returns table (refund_id uuid, amount_minor bigint, gateway text, gateway_ref text, reason text)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.amount_minor, p.gateway, p.gateway_ref, r.reason
  from public.refunds r join public.payments p on p.id = r.payment_id
  where r.id = p_refund and r.status = 'approved' and (app_private.is_service() or app_private.has_permission('payments.refund.approve'));
$$;

-- Template variable and seeds for payment links and failures
create or replace function app_private.allowed_template_vars()
returns text[]
language sql
immutable
as $$ select array['customer.name', 'customer.first_name', 'order.number', 'order.status', 'order.total', 'order.balance', 'puppy.name', 'puppy.breed', 'delivery.method',
  'delivery.tracking_no', 'delivery.eta', 'delivery.carrier', 'delivery.status', 'delivery.note', 'delivery.location', 'invoice.number', 'invoice.total', 'invoice.due_date',
  'payment.amount', 'payment.method', 'payment.reference', 'payment.link', 'refund.amount', 'business.name', 'business.phone', 'business.whatsapp_url', 'enquiry.message'] $$;

insert into public.message_templates (key, channel, subject, body, is_active) values
  ('payment_link', 'email', 'Pay for order {{order.number}}', E'Hi {{customer.first_name}},\n\nYou can pay {{payment.amount}} for order {{order.number}} securely here:\n{{payment.link}}\n\nIf you have any questions just reply to this message.\n\n{{business.name}}', true),
  ('payment_failed_customer', 'email', 'Your payment for {{order.number}} did not go through', E'Hi {{customer.first_name}},\n\nYour payment for order {{order.number}} did not complete. Nothing was charged. You can try again with a new link, or message us on WhatsApp: {{business.whatsapp_url}}\n\n{{business.name}}', true);
insert into public.notification_rules (event, channel, template_key, recipient_type, recipient_ref, enabled, in_app_title, in_app_body) values
  ('payment.failed', 'in_app', null, 'staff_role', 'super_admin', true, 'Payment failed', 'A payment for order {{order.number}} failed.'),
  ('payment.failed', 'email', 'payment_failed_customer', 'customer', null, false, null, null);

revoke all on function public.start_gateway_payment(uuid, uuid, text, text, bigint, text), public.complete_gateway_refund(uuid, text), public.fail_gateway_refund(uuid, text), public.refund_context(uuid) from public, anon;
grant execute on function public.start_gateway_payment(uuid, uuid, text, text, bigint, text), public.complete_gateway_refund(uuid, text), public.fail_gateway_refund(uuid, text), public.refund_context(uuid) to authenticated, service_role;
revoke all on function public.settle_gateway_payment(text, text, text, bigint, text, timestamptz, jsonb), public.fail_gateway_payment(text, text, text, text) from public, anon, authenticated;
grant execute on function public.settle_gateway_payment(text, text, text, bigint, text, timestamptz, jsonb), public.fail_gateway_payment(text, text, text, text) to service_role;
revoke all on function app_private.finish_refund(uuid, text) from public, anon, authenticated;
revoke all on function public.decide_refund(uuid, boolean, text) from public, anon;
grant execute on function public.decide_refund(uuid, boolean, text) to authenticated, service_role;
