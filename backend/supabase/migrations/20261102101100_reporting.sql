-- B10 reporting: one JSON document for the dashboard, and capped, permissioned export rows.
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_month_start timestamptz := date_trunc('month', now());
begin
  perform app_private.require_permission('dashboard.read');
  return jsonb_build_object(
    'enquiries', jsonb_build_object(
      'new', (select count(*) from public.enquiries where status = 'new'),
      'open', (select count(*) from public.enquiries where status in ('new', 'contacted', 'qualified')),
      'unassigned', (select count(*) from public.enquiries where status in ('new', 'contacted', 'qualified') and assigned_to is null),
      'last7days', (select count(*) from public.enquiries where created_at >= now() - interval '7 days')),
    'orders', jsonb_build_object(
      'open', (select count(*) from public.orders where status not in ('completed', 'cancelled')),
      'byStatus', coalesce((select jsonb_object_agg(status, n) from (select status, count(*) n from public.orders group by status) s), '{}'::jsonb),
      'createdThisMonth', (select count(*) from public.orders where created_at >= v_month_start)),
    'deliveries', jsonb_build_object(
      'open', (select count(*) from public.deliveries where status not in ('delivered', 'failed')),
      'delayed', (select count(*) from public.deliveries where status = 'delayed')),
    'money', jsonb_build_object(
      'paidThisMonthMinor', coalesce((select sum(amount_minor) from public.payments where status in ('succeeded', 'partially_refunded', 'refunded') and paid_at >= v_month_start), 0)
        - coalesce((select sum(r.amount_minor) from public.refunds r where r.status = 'processed' and r.processed_at >= v_month_start), 0),
      'outstandingMinor', coalesce((select sum(total_minor - paid_minor) from public.invoices where status in ('issued', 'partially_paid', 'overdue')), 0),
      'overdueInvoices', (select count(*) from public.invoices where status = 'overdue'),
      'failedPayments7days', (select count(*) from public.payments where status = 'failed' and created_at >= now() - interval '7 days'),
      'refundsWaiting', (select count(*) from public.refunds where status = 'requested')),
    'puppies', jsonb_build_object(
      'available', (select count(*) from public.puppies where status = 'available' and deleted_at is null),
      'reserved', (select count(*) from public.puppies where status = 'reserved' and deleted_at is null),
      'drafts', (select count(*) from public.puppies where published_at is null and deleted_at is null)),
    'system', jsonb_build_object(
      'outboxPending', (select count(*) from public.outbox where status = 'pending'),
      'outboxFailed', (select count(*) from public.outbox where status = 'failed'),
      'oldestPendingMinutes', coalesce((select (extract(epoch from now() - min(created_at)) / 60)::int from public.outbox where status = 'pending'), 0))
  );
end;
$$;

-- Export rows (capped at 10,000, one year at most). Each kind has its own permission; customers are exported
-- through the privacy tooling instead, so personal data leaves only by an audited, subject-specific path.
create or replace function public.export_rows(p_kind text, p_from date, p_to date)
returns setof jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 366 then raise exception 'Choose a date range of at most one year' using errcode = '22023'; end if;
  if p_kind = 'enquiries' then
    perform app_private.require_permission('enquiries.export');
    return query select to_jsonb(r) from (
      select e.created_at, e.name, e.phone, e.email, e.area, e.source::text, e.status::text, pu.slug as puppy, e.source_page
      from public.enquiries e left join public.puppies pu on pu.id = e.puppy_id
      where e.created_at >= p_from and e.created_at < p_to + 1 order by e.created_at desc limit 10000) r;
  elsif p_kind = 'orders' then
    perform app_private.require_permission('payments.export');
    return query select to_jsonb(r) from (
      select o.number, o.created_at, c.full_name as customer, o.type::text, o.status::text, o.currency, o.total_minor, o.tax_minor, o.paid_minor, o.balance_minor
      from public.orders o join public.customers c on c.id = o.customer_id
      where o.created_at >= p_from and o.created_at < p_to + 1 order by o.created_at desc limit 10000) r;
  elsif p_kind = 'payments' then
    perform app_private.require_permission('payments.export');
    return query select to_jsonb(r) from (
      select p.paid_at, o.number as order_number, i.number as invoice_number, p.gateway, p.gateway_ref, p.method::text, p.status::text, p.currency, p.amount_minor
      from public.payments p join public.orders o on o.id = p.order_id left join public.invoices i on i.id = p.invoice_id
      where p.paid_at >= p_from and p.paid_at < p_to + 1 order by p.paid_at desc limit 10000) r;
  elsif p_kind = 'invoices' then
    perform app_private.require_permission('payments.export');
    return query select to_jsonb(r) from (
      select i.number, i.issued_at, i.due_at, c.full_name as customer, i.status::text, i.currency, i.subtotal_minor, i.tax_minor, i.total_minor, i.paid_minor
      from public.invoices i join public.customers c on c.id = i.customer_id
      where i.created_at >= p_from and i.created_at < p_to + 1 and i.status <> 'draft' order by i.created_at desc limit 10000) r;
  else
    raise exception 'Unknown export' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.admin_dashboard_stats(), public.export_rows(text, date, date) from public, anon;
grant execute on function public.admin_dashboard_stats(), public.export_rows(text, date, date) to authenticated, service_role;
