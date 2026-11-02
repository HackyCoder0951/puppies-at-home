-- B11 privacy tooling (docs/03-security-privacy/06 section 6): subject export, erasure by anonymisation, processing
-- restriction, consent withdrawal, request (DSR) workflow, retention job and an append-only audit log.
alter table public.dsr_requests add column requester_name text, add column contact text, add column details text;

-- The audit log is append-only. Only the retention functions below may touch rows, by setting a transaction-local flag.
create or replace function app_private.guard_audit_log()
returns trigger
language plpgsql
as $$
begin
  if coalesce(current_setting('app.audit_maintenance', true), '') = 'on' then
    return coalesce(new, old);
  end if;
  raise exception 'The audit log is append-only' using errcode = 'P0001';
end;
$$;
create trigger audit_log_append_only before update or delete on public.audit_log for each row execute function app_private.guard_audit_log();
create trigger audit_log_no_truncate before truncate on public.audit_log for each statement execute function app_private.guard_audit_log();

-- Erasure by anonymisation (shared by a subject request and the retention job). Commercial records the law requires
-- (orders, invoices, payments) stay, without free text; everything that identifies the person goes, including the
-- copies inside audit snapshots.
create or replace function app_private.anonymise_customer(p_customer uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enquiries uuid[];
  v_orders uuid[];
  v_messages integer;
  v_notes integer;
begin
  select coalesce(array_agg(id), '{}') into v_enquiries from public.enquiries where customer_id = p_customer;
  select coalesce(array_agg(id), '{}') into v_orders from public.orders where customer_id = p_customer;
  perform set_config('app.audit_maintenance', 'on', true);

  update public.customers set full_name = 'Anonymised customer', phone_e164 = null, phone_display = null, email = null, area = null, notes = null, tags = '{}',
    notification_prefs = '{"email": false, "whatsapp": false}', whatsapp_opt_in_source = null, anonymised_at = now() where id = p_customer;
  update public.enquiries set name = 'Anonymised', phone = null, email = null, area = null, message = null, ip_hash = null, user_agent = null where customer_id = p_customer;
  update public.enquiry_notes set body = '[removed]' where enquiry_id = any (v_enquiries);
  get diagnostics v_notes = row_count;
  update public.messages set to_address = null, subject = null, body = '[removed]' where customer_id = p_customer;
  get diagnostics v_messages = row_count;
  update public.orders set notes = null where customer_id = p_customer;
  update public.deliveries set address = null where order_id = any (v_orders);
  update public.consent_records set ip_hash = null where customer_id = p_customer;

  -- Audit snapshots must not keep the data that was just removed. The record of the erasure itself stays.
  update public.audit_log set before = null, after = null where entity in ('customers', 'enquiries', 'enquiry_notes') and entity_id in (
    select p_customer::text union select unnest(v_enquiries)::text union select id::text from public.enquiry_notes where enquiry_id = any (v_enquiries));
  update public.audit_log set before = before - 'notes', after = after - 'notes' where entity = 'orders' and entity_id in (select unnest(v_orders)::text);
  update public.audit_log set before = before - 'address', after = after - 'address' where entity = 'deliveries' and entity_id in (select id::text from public.deliveries where order_id = any (v_orders));
  perform set_config('app.audit_maintenance', 'off', true);
  return jsonb_build_object('enquiries', cardinality(v_enquiries), 'orders_kept', cardinality(v_orders), 'messages', v_messages, 'notes', v_notes);
end;
$$;

-- Access and portability: everything held about one customer as one JSON document.
create or replace function public.export_subject(p_customer uuid, p_dsr uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_doc jsonb;
begin
  perform app_private.require_permission('privacy.export');
  if not exists (select 1 from public.customers where id = p_customer) then raise exception 'Unknown customer' using errcode = '22023'; end if;
  select jsonb_build_object(
    'generatedAt', now(),
    'customer', (select to_jsonb(c) - 'id' from public.customers c where c.id = p_customer),
    'enquiries', coalesce((select jsonb_agg(jsonb_build_object('receivedAt', e.created_at, 'source', e.source, 'name', e.name, 'phone', e.phone, 'email', e.email, 'area', e.area, 'message', e.message, 'status', e.status,
      'notes', (select coalesce(jsonb_agg(jsonb_build_object('at', n.created_at, 'note', n.body) order by n.created_at), '[]'::jsonb) from public.enquiry_notes n where n.enquiry_id = e.id)) order by e.created_at)
      from public.enquiries e where e.customer_id = p_customer), '[]'::jsonb),
    'consents', coalesce((select jsonb_agg(jsonb_build_object('purpose', r.purpose, 'textVersion', r.text_version, 'givenAt', r.given_at, 'channel', r.channel, 'source', r.source, 'withdrawnAt', r.withdrawn_at) order by r.given_at)
      from public.consent_records r where r.customer_id = p_customer), '[]'::jsonb),
    'orders', coalesce((select jsonb_agg(jsonb_build_object('number', o.number, 'createdAt', o.created_at, 'status', o.status, 'currency', o.currency, 'total', o.total_minor, 'vat', o.tax_minor, 'paid', o.paid_minor, 'notes', o.notes,
      'items', (select coalesce(jsonb_agg(jsonb_build_object('description', i.description, 'quantity', i.quantity, 'unit', i.unit_minor) order by i.sort_order), '[]'::jsonb) from public.order_items i where i.order_id = o.id),
      'deliveries', (select coalesce(jsonb_agg(jsonb_build_object('method', d.method, 'carrier', d.carrier, 'tracking', d.tracking_no, 'address', d.address, 'status', d.status, 'eta', d.eta)), '[]'::jsonb) from public.deliveries d where d.order_id = o.id)) order by o.created_at)
      from public.orders o where o.customer_id = p_customer), '[]'::jsonb),
    'invoices', coalesce((select jsonb_agg(jsonb_build_object('number', v.number, 'issuedAt', v.issued_at, 'status', v.status, 'total', v.total_minor, 'paid', v.paid_minor) order by v.created_at) from public.invoices v where v.customer_id = p_customer), '[]'::jsonb),
    'payments', coalesce((select jsonb_agg(jsonb_build_object('paidAt', p.paid_at, 'method', p.method, 'status', p.status, 'amount', p.amount_minor, 'reference', p.gateway_ref) order by p.paid_at)
      from public.payments p join public.orders o on o.id = p.order_id where o.customer_id = p_customer), '[]'::jsonb),
    'messages', coalesce((select jsonb_agg(jsonb_build_object('sentAt', m.created_at, 'channel', m.channel, 'to', m.to_address, 'subject', m.subject, 'body', m.body, 'status', m.status) order by m.created_at) from public.messages m where m.customer_id = p_customer), '[]'::jsonb)
  ) into v_doc;
  insert into public.audit_log (actor_id, action, entity, entity_id, after) values ((select auth.uid()), 'privacy.export', 'customers', p_customer::text, jsonb_build_object('dsr', p_dsr));
  return v_doc;
end;
$$;

create or replace function public.anonymise_subject(p_customer uuid, p_dsr uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_summary jsonb;
begin
  perform app_private.require_permission('privacy.erase');
  if not exists (select 1 from public.customers where id = p_customer and anonymised_at is null) then raise exception 'That customer is unknown or already anonymised' using errcode = '22023'; end if;
  v_summary := app_private.anonymise_customer(p_customer);
  insert into public.audit_log (actor_id, action, entity, entity_id, after) values ((select auth.uid()), 'privacy.anonymise', 'customers', p_customer::text, jsonb_build_object('dsr', p_dsr) || v_summary);
  if p_dsr is not null then
    update public.dsr_requests set exceptions = coalesce(exceptions || E'\n', '') || 'Order, invoice and payment records are kept for legal obligations (see retention policy); free text was removed.' where id = p_dsr;
  end if;
  return v_summary;
end;
$$;

create or replace function public.set_processing_restriction(p_customer uuid, p_restricted boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_permission('privacy.manage');
  update public.customers set restricted_at = case when p_restricted then now() else null end where id = p_customer and anonymised_at is null;
  if not found then raise exception 'Unknown customer' using errcode = '22023'; end if;
  insert into public.audit_log (actor_id, action, entity, entity_id, after) values ((select auth.uid()), case when p_restricted then 'privacy.restrict' else 'privacy.unrestrict' end, 'customers', p_customer::text, null);
end;
$$;

-- Withdrawing consent is recorded and takes effect at once (the messaging worker reads these fields).
create or replace function public.withdraw_consent(p_customer uuid, p_purpose text, p_channel text default 'staff')
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  perform app_private.require_permission('privacy.manage');
  update public.consent_records set withdrawn_at = now(), withdrawal_channel = left(p_channel, 40)
  where customer_id = p_customer and purpose = p_purpose::public.consent_purpose and withdrawn_at is null;
  get diagnostics v_count = row_count;
  if p_purpose = 'whatsapp_updates' then update public.customers set whatsapp_opted_out_at = now() where id = p_customer; end if;
  if p_purpose = 'marketing_email' then update public.customers set notification_prefs = jsonb_set(notification_prefs, '{marketing}', 'false') where id = p_customer; end if;
  insert into public.audit_log (actor_id, action, entity, entity_id, after) values ((select auth.uid()), 'privacy.withdraw_consent', 'customers', p_customer::text, jsonb_build_object('purpose', p_purpose, 'records', v_count));
  return v_count;
exception when invalid_text_representation then
  raise exception 'Unknown consent purpose' using errcode = '22023';
end;
$$;

-- Request (DSR) workflow
create or replace function public.create_dsr(p_type text, p_requester text, p_contact text, p_details text, p_customer uuid default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not (app_private.has_permission('privacy.manage') or app_private.has_permission('privacy.intake')) then raise exception 'Requires privacy.intake' using errcode = '42501'; end if;
  if char_length(btrim(coalesce(p_requester, ''))) < 2 or char_length(btrim(coalesce(p_contact, ''))) < 3 then raise exception 'Requester name and contact are required' using errcode = '22023'; end if;
  insert into public.dsr_requests (subject_ref, type, requester_name, contact, details, handler_id)
  values (coalesce(p_customer::text, 'unmatched'), p_type::public.dsr_type, btrim(p_requester), btrim(p_contact), nullif(left(btrim(coalesce(p_details, '')), 2000), ''), (select auth.uid()))
  returning id into v_id;
  return v_id;
exception when invalid_text_representation then
  raise exception 'Unknown request type' using errcode = '22023';
end;
$$;

create or replace function public.update_dsr(p_id uuid, p_status text, p_exceptions text default null, p_identity_verified boolean default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform app_private.require_permission('privacy.manage');
  update public.dsr_requests set
    status = p_status::public.dsr_status,
    exceptions = coalesce(nullif(btrim(p_exceptions), ''), exceptions),
    identity_verified_at = case when p_identity_verified is true then coalesce(identity_verified_at, now()) when p_identity_verified is false then null else identity_verified_at end,
    completed_at = case when p_status in ('completed', 'rejected') then coalesce(completed_at, now()) else null end,
    due_at = case when p_status = 'extended' then received_at + interval '90 days' else due_at end
  where id = p_id;
  if not found then raise exception 'Unknown request' using errcode = '22023'; end if;
exception when invalid_text_representation then
  raise exception 'Unknown request status' using errcode = '22023';
end;
$$;

-- Daily retention job (service role): enquiries and customers without orders after 24 months, old messages, login attempts.
create or replace function public.anonymise_old_records()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer uuid;
  v_customers integer := 0;
  v_attempts integer;
  v_messages integer;
begin
  if not app_private.is_service() then raise exception 'Service role only' using errcode = '42501'; end if;
  for v_customer in
    select c.id from public.customers c
    where c.anonymised_at is null and c.deleted_at is null
      and not exists (select 1 from public.orders o where o.customer_id = c.id)
      and coalesce((select max(e.created_at) from public.enquiries e where e.customer_id = c.id), c.created_at) < now() - interval '24 months'
  loop
    perform app_private.anonymise_customer(v_customer);
    v_customers := v_customers + 1;
  end loop;
  perform set_config('app.audit_maintenance', 'on', true);
  update public.messages set to_address = null, subject = null, body = '[removed]' where created_at < now() - interval '24 months' and body <> '[removed]';
  get diagnostics v_messages = row_count;
  perform set_config('app.audit_maintenance', 'off', true);
  delete from public.login_attempts where created_at < now() - interval '30 days';
  get diagnostics v_attempts = row_count;
  return jsonb_build_object('customersAnonymised', v_customers, 'messagesCleared', v_messages, 'loginAttemptsDeleted', v_attempts);
end;
$$;

-- Audit retention (7 years): the only path that may delete audit rows.
create or replace function public.prune_audit_log(p_years integer default 7)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not app_private.is_service() then raise exception 'Service role only' using errcode = '42501'; end if;
  if p_years < 7 then raise exception 'The audit log is kept for at least 7 years' using errcode = '22023'; end if;
  perform set_config('app.audit_maintenance', 'on', true);
  delete from public.audit_log where created_at < now() - make_interval(years => p_years);
  get diagnostics v_count = row_count;
  perform set_config('app.audit_maintenance', 'off', true);
  return v_count;
end;
$$;

revoke all on function public.export_subject(uuid, uuid), public.anonymise_subject(uuid, uuid), public.set_processing_restriction(uuid, boolean), public.withdraw_consent(uuid, text, text),
  public.create_dsr(text, text, text, text, uuid), public.update_dsr(uuid, text, text, boolean) from public, anon;
grant execute on function public.export_subject(uuid, uuid), public.anonymise_subject(uuid, uuid), public.set_processing_restriction(uuid, boolean), public.withdraw_consent(uuid, text, text),
  public.create_dsr(text, text, text, text, uuid), public.update_dsr(uuid, text, text, boolean) to authenticated, service_role;
revoke all on function public.anonymise_old_records(), public.prune_audit_log(integer) from public, anon, authenticated;
grant execute on function public.anonymise_old_records(), public.prune_audit_log(integer) to service_role;
revoke all on function app_private.anonymise_customer(uuid) from public, anon, authenticated;
