-- Public privacy request intake (docs/03-security-privacy/06 section 6.6): a visitor can ask to see, correct or erase their data.
-- Callable by anyone (like create_enquiry); the app rate limits it. Matching a customer is best effort and only by exact phone or email.
create or replace function public.intake_privacy_request(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(payload ->> 'name', ''));
  v_contact text := btrim(coalesce(payload ->> 'contact', ''));
  v_details text := nullif(left(btrim(coalesce(payload ->> 'details', '')), 2000), '');
  v_type public.dsr_type;
  v_phone text := app_private.to_e164(v_contact);
  v_email text := case when v_contact ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then lower(v_contact) end;
  v_customer uuid;
  v_id uuid;
begin
  if char_length(v_name) < 2 or char_length(v_name) > 120 then raise exception 'invalid name' using errcode = '22023'; end if;
  if v_phone is null and v_email is null then raise exception 'invalid contact' using errcode = '22023'; end if;
  begin
    v_type := (payload ->> 'type')::public.dsr_type;
  exception when invalid_text_representation or others then
    raise exception 'invalid type' using errcode = '22023';
  end;
  select c.id into v_customer from public.customers c
  where c.deleted_at is null and c.anonymised_at is null and ((v_phone is not null and c.phone_e164 = v_phone) or (v_email is not null and lower(c.email) = v_email))
  order by c.created_at limit 1;
  insert into public.dsr_requests (subject_ref, type, requester_name, contact, details)
  values (coalesce(v_customer::text, 'unmatched'), v_type, v_name, left(v_contact, 200), v_details)
  returning id into v_id;
  return jsonb_build_object('id', v_id);
end;
$$;
revoke all on function public.intake_privacy_request(jsonb) from public;
grant execute on function public.intake_privacy_request(jsonb) to anon, authenticated, service_role;

-- Staff are told as soon as a request arrives (the 30-day clock starts at receipt).
create or replace function app_private.emit_dsr()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.emit('privacy.request_received', 'dsr', new.id::text, jsonb_build_object('dsrId', new.id, 'type', new.type), 'privacy.request_received:' || new.id);
  return new;
end;
$$;
create trigger dsr_requests_emit after insert on public.dsr_requests for each row execute function app_private.emit_dsr();

insert into public.notification_rules (event, channel, template_key, recipient_type, recipient_ref, enabled, in_app_title, in_app_body) values
  ('privacy.request_received', 'in_app', null, 'staff_role', 'super_admin', true, 'Privacy request received', 'A data request needs a reply within 30 days. Open Privacy to handle it.');
