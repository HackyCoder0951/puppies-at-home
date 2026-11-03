-- Assistant trajectory and feedback records (docs/06-quality/29 section 4). Text-free by design: counts, versions, outcomes and
-- ratings, never what a visitor typed. Anyone may append through the validated function (like create_enquiry); only people with
-- audit access may read; retention is pruned by the daily job.
create table public.assistant_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('turn', 'feedback')),
  conversation_id text not null check (char_length(conversation_id) between 1 and 80),
  message_id text check (message_id is null or char_length(message_id) <= 80),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and char_length(data::text) <= 2000),
  created_at timestamptz not null default now()
);
create index assistant_events_created_idx on public.assistant_events (created_at);
create index assistant_events_conversation_idx on public.assistant_events (conversation_id);

alter table public.assistant_events enable row level security;
alter table public.assistant_events force row level security;
revoke all on public.assistant_events from anon, authenticated;
grant select on public.assistant_events to authenticated;
create policy assistant_events_select on public.assistant_events for select to authenticated
  using ((select app_private.has_permission('audit.read')));

create or replace function public.record_assistant_event(p_kind text, p_conversation text, p_message text, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_kind not in ('turn', 'feedback') then raise exception 'invalid kind' using errcode = '22023'; end if;
  if char_length(coalesce(p_conversation, '')) not between 1 and 80 then raise exception 'invalid conversation' using errcode = '22023'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or char_length(p_data::text) > 2000 then raise exception 'invalid data' using errcode = '22023'; end if;
  insert into public.assistant_events (kind, conversation_id, message_id, data) values (p_kind, p_conversation, left(p_message, 80), p_data);
end;
$$;
revoke all on function public.record_assistant_event(text, text, text, jsonb) from public;
grant execute on function public.record_assistant_event(text, text, text, jsonb) to anon, authenticated, service_role;

-- Retention (decision D21: trajectories 12 months) and deletion of one conversation's records (privacy requests).
create or replace function public.prune_assistant_events(p_days integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not app_private.is_service() then raise exception 'Service role only' using errcode = '42501'; end if;
  delete from public.assistant_events where created_at < now() - make_interval(days => greatest(p_days, 1));
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
create or replace function public.delete_assistant_conversation(p_conversation text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not app_private.is_service() then raise exception 'Service role only' using errcode = '42501'; end if;
  delete from public.assistant_events where conversation_id = p_conversation;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke all on function public.prune_assistant_events(integer), public.delete_assistant_conversation(text) from public, anon, authenticated;
grant execute on function public.prune_assistant_events(integer), public.delete_assistant_conversation(text) to service_role;
