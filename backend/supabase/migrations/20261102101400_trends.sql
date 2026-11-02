-- Daily counts and amounts for the last 14 days (including today), for the dashboard sparklines. One call, indexed columns only.
create or replace function public.admin_trend_series(p_days integer default 14)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days integer := least(greatest(coalesce(p_days, 14), 7), 90);
begin
  perform app_private.require_permission('dashboard.read');
  return (
    select jsonb_build_object(
      'days', jsonb_agg(to_char(d.day, 'YYYY-MM-DD') order by d.day),
      'enquiries', jsonb_agg((select count(*) from public.enquiries e where e.created_at >= d.day and e.created_at < d.day + interval '1 day') order by d.day),
      'orders', jsonb_agg((select count(*) from public.orders o where o.created_at >= d.day and o.created_at < d.day + interval '1 day') order by d.day),
      'receivedMinor', jsonb_agg(coalesce((select sum(p.amount_minor) from public.payments p where p.status in ('succeeded', 'partially_refunded', 'refunded') and p.paid_at >= d.day and p.paid_at < d.day + interval '1 day'), 0) order by d.day))
    from generate_series(current_date - (v_days - 1), current_date, interval '1 day') as d(day));
end;
$$;
revoke all on function public.admin_trend_series(integer) from public, anon;
grant execute on function public.admin_trend_series(integer) to authenticated, service_role;
