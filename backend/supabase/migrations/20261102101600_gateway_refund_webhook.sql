-- Refunds made at the gateway (dashboard, dispute outcome) reach the ledger through the signed charge.refunded webhook.
-- The event carries the cumulative refunded amount for the charge, so replays and refunds started here change nothing.
create or replace function public.record_gateway_refund(p_gateway text, p_payment_intent text, p_event_id text, p_total_refunded_minor bigint, p_currency text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  p record;
  v_known bigint;
  v_diff bigint;
  v_refund uuid;
begin
  if not app_private.is_service() then raise exception 'Service role only' using errcode = '42501'; end if;
  insert into public.webhook_events (gateway, event_id) values (p_gateway, p_event_id) on conflict do nothing;
  if not found and exists (select 1 from public.webhook_events where gateway = p_gateway and event_id = p_event_id and processed_at is not null) then return 'duplicate_event'; end if;

  select * into p from public.payments where gateway = p_gateway and raw ->> 'paymentIntent' = p_payment_intent for update;
  if not found then
    update public.webhook_events set processed_at = now() where gateway = p_gateway and event_id = p_event_id;
    return 'unknown_payment';
  end if;
  if upper(p.currency) <> upper(p_currency) or p_total_refunded_minor > p.amount_minor then
    insert into public.notifications (user_id, kind, title, body, link)
    select pr.user_id, 'alert', 'Refund does not match the payment', 'Gateway ' || p_gateway || ' reports ' || p_total_refunded_minor || ' ' || upper(p_currency) || ' refunded on a payment of ' || p.amount_minor || ' ' || p.currency || '.', '/admin/payments'
    from public.profiles pr where pr.role = 'super_admin' and pr.disabled_at is null;
    update public.webhook_events set processed_at = now() where gateway = p_gateway and event_id = p_event_id;
    return 'amount_mismatch';
  end if;

  select coalesce(sum(amount_minor), 0) into v_known from public.refunds where payment_id = p.id and status in ('approved', 'processed');
  v_diff := p_total_refunded_minor - v_known;
  if v_diff <= 0 then
    update public.webhook_events set processed_at = now() where gateway = p_gateway and event_id = p_event_id;
    return 'already_recorded';
  end if;
  insert into public.refunds (payment_id, amount_minor, reason, status, gateway_ref)
  values (p.id, v_diff, 'Refunded at the payment gateway', 'processed', p_event_id)
  returning id into v_refund;
  perform app_private.finish_refund(v_refund, p_event_id);
  update public.webhook_events set processed_at = now() where gateway = p_gateway and event_id = p_event_id;
  return 'refund_recorded';
end;
$$;
revoke all on function public.record_gateway_refund(text, text, text, bigint, text) from public, anon, authenticated;
grant execute on function public.record_gateway_refund(text, text, text, bigint, text) to service_role;
