-- WhatsApp Cloud API webhooks: delivery receipts move the message log forward only, and customer replies are handled
-- (STOP withdraws consent at once, START restores it for someone who had opted in, anything else is forwarded to staff).
create or replace function public.apply_whatsapp_status(p_event_id text, p_provider_id text, p_status text, p_error text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  m record;
  v_rank integer;
  v_new_rank integer;
begin
  if not app_private.is_service() then raise exception 'Service role only' using errcode = '42501'; end if;
  insert into public.webhook_events (gateway, event_id) values ('whatsapp', p_event_id) on conflict do nothing;
  if not found then return 'duplicate_event'; end if;
  if p_status not in ('sent', 'delivered', 'read', 'failed') then
    update public.webhook_events set processed_at = now() where gateway = 'whatsapp' and event_id = p_event_id;
    return 'ignored';
  end if;
  select id, status into m from public.messages where provider_id = p_provider_id for update;
  if not found then
    update public.webhook_events set processed_at = now() where gateway = 'whatsapp' and event_id = p_event_id;
    return 'unknown_message';
  end if;
  v_rank := case m.status when 'queued' then 0 when 'sent' then 1 when 'delivered' then 2 when 'read' then 3 else 4 end;
  v_new_rank := case p_status when 'sent' then 1 when 'delivered' then 2 when 'read' then 3 else 1 end;
  -- Receipts can arrive out of order: only move forward; a failure never overrides a delivered or read message.
  if m.status in ('failed', 'skipped', 'handed_off') or v_new_rank <= v_rank then
    update public.webhook_events set processed_at = now() where gateway = 'whatsapp' and event_id = p_event_id;
    return 'ignored';
  end if;
  update public.messages set status = p_status::public.message_status, error = case when p_status = 'failed' then left(coalesce(p_error, 'delivery failed'), 300) else error end where id = m.id;
  update public.webhook_events set processed_at = now() where gateway = 'whatsapp' and event_id = p_event_id;
  return 'updated';
end;
$$;

create or replace function public.record_whatsapp_inbound(p_event_id text, p_phone text, p_text text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  c record;
  v_phone text := '+' || regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_word text := lower(btrim(coalesce(p_text, '')));
  v_name text;
begin
  if not app_private.is_service() then raise exception 'Service role only' using errcode = '42501'; end if;
  insert into public.webhook_events (gateway, event_id) values ('whatsapp', p_event_id) on conflict do nothing;
  if not found then return 'duplicate_event'; end if;
  select id, full_name, whatsapp_opt_in_at, whatsapp_opted_out_at into c from public.customers where phone_e164 = v_phone limit 1;
  if found and v_word in ('stop', 'unsubscribe', 'cancel', 'end', 'quit') then
    update public.customers set whatsapp_opted_out_at = coalesce(whatsapp_opted_out_at, now()) where id = c.id;
    update public.webhook_events set processed_at = now() where gateway = 'whatsapp' and event_id = p_event_id;
    return 'opted_out';
  end if;
  if found and v_word in ('start', 'subscribe') and c.whatsapp_opt_in_at is not null then
    update public.customers set whatsapp_opted_out_at = null where id = c.id;
    update public.webhook_events set processed_at = now() where gateway = 'whatsapp' and event_id = p_event_id;
    return 'opted_in';
  end if;
  v_name := coalesce(c.full_name, v_phone);
  insert into public.notifications (user_id, kind, title, body, link)
  select pr.user_id, 'info', 'WhatsApp message from ' || v_name, left(coalesce(p_text, ''), 200), case when c.id is not null then '/admin/customers/' || c.id else null end
  from public.profiles pr where pr.disabled_at is null;
  update public.webhook_events set processed_at = now() where gateway = 'whatsapp' and event_id = p_event_id;
  return case when c.id is not null then 'forwarded' else 'forwarded_unknown' end;
end;
$$;
revoke all on function public.apply_whatsapp_status(text, text, text, text), public.record_whatsapp_inbound(text, text, text) from public, anon, authenticated;
grant execute on function public.apply_whatsapp_status(text, text, text, text), public.record_whatsapp_inbound(text, text, text) to service_role;
