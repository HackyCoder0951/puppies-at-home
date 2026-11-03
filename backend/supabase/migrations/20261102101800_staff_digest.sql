-- Daily staff digest: one outbox event per day carrying the counts, delivered as an in-app note and an email to staff.
create or replace function app_private.allowed_template_vars()
returns text[]
language sql
immutable
as $$ select array['customer.name', 'customer.first_name', 'order.number', 'order.status', 'order.total', 'order.balance', 'puppy.name', 'puppy.breed', 'delivery.method',
  'delivery.tracking_no', 'delivery.eta', 'delivery.carrier', 'delivery.status', 'delivery.note', 'delivery.location', 'invoice.number', 'invoice.total', 'invoice.due_date',
  'payment.amount', 'payment.method', 'payment.reference', 'refund.amount', 'business.name', 'business.phone', 'business.whatsapp_url', 'enquiry.message',
  'digest.date', 'digest.new_enquiries', 'digest.open_enquiries', 'digest.orders_to_confirm', 'digest.overdue_invoices', 'digest.refunds_waiting', 'digest.delayed_deliveries'] $$;

-- Service role only (cron). Idempotent per Dubai calendar day; nothing is queued on a quiet day.
create or replace function public.queue_staff_digest()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Asia/Dubai')::date;
  v jsonb;
begin
  if not app_private.is_service() then raise exception 'Service role only' using errcode = '42501'; end if;
  v := jsonb_build_object(
    'date', to_char(v_today, 'DD Mon YYYY'),
    'new_enquiries', (select count(*) from public.enquiries where created_at >= now() - interval '24 hours'),
    'open_enquiries', (select count(*) from public.enquiries where status in ('new', 'contacted', 'qualified')),
    'orders_to_confirm', (select count(*) from public.orders where status = 'new'),
    'overdue_invoices', (select count(*) from public.invoices where status = 'overdue'),
    'refunds_waiting', (select count(*) from public.refunds where status = 'requested'),
    'delayed_deliveries', (select count(*) from public.deliveries where status = 'delayed'));
  if (select sum(value::int) from jsonb_each_text(v - 'date')) = 0 then return 'quiet'; end if;
  if exists (select 1 from public.outbox where dedupe_key = 'staff.digest:' || v_today) then return 'already_queued'; end if;
  perform app_private.emit('staff.digest', 'digest', v_today::text, v, 'staff.digest:' || v_today);
  return 'queued';
end;
$$;
revoke all on function public.queue_staff_digest() from public, anon, authenticated;
grant execute on function public.queue_staff_digest() to service_role;

insert into public.message_templates (key, channel, subject, body, is_active) values
  ('staff_digest', 'email', 'Daily digest for {{digest.date}}', E'Good morning,\n\nHere is where things stand at {{business.name}}:\n\n- New enquiries in the last 24 hours: {{digest.new_enquiries}}\n- Enquiries still open: {{digest.open_enquiries}}\n- Orders waiting to be confirmed: {{digest.orders_to_confirm}}\n- Overdue invoices: {{digest.overdue_invoices}}\n- Refunds waiting for approval: {{digest.refunds_waiting}}\n- Delayed deliveries: {{digest.delayed_deliveries}}\n\nOpen the portal to act on them.', true);

insert into public.notification_rules (event, channel, template_key, recipient_type, recipient_ref, enabled, in_app_title, in_app_body) values
  ('staff.digest', 'in_app', null, 'staff_role', 'any', true, 'Daily digest', '{{digest.new_enquiries}} new enquiries, {{digest.orders_to_confirm}} orders to confirm, {{digest.overdue_invoices}} overdue invoices.'),
  ('staff.digest', 'email', 'staff_digest', 'staff_role', 'any', true, null, null);
