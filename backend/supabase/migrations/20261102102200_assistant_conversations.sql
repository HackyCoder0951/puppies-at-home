-- Assistant conversations with redacted text (decision D21: 30 days). The conversation id is an unguessable random id held only by
-- the visitor's browser tab, so it works as a bearer capability for appending, loading and forgetting. Staff with audit access may read.
create table public.assistant_conversations (
  id text primary key check (char_length(id) between 16 and 80),
  started_at timestamptz not null default now()
);
create table public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null references public.assistant_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  text text not null check (char_length(text) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index assistant_messages_conversation_idx on public.assistant_messages (conversation_id, created_at);
create index assistant_messages_created_idx on public.assistant_messages (created_at);

alter table public.assistant_conversations enable row level security;
alter table public.assistant_conversations force row level security;
alter table public.assistant_messages enable row level security;
alter table public.assistant_messages force row level security;
revoke all on public.assistant_conversations, public.assistant_messages from anon, authenticated;
grant select on public.assistant_conversations, public.assistant_messages to authenticated;
create policy assistant_conversations_select on public.assistant_conversations for select to authenticated using ((select app_private.has_permission('audit.read')));
create policy assistant_messages_select on public.assistant_messages for select to authenticated using ((select app_private.has_permission('audit.read')));

create or replace function public.assistant_start_conversation(p_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(coalesce(p_id, '')) not between 16 and 80 then raise exception 'invalid conversation' using errcode = '22023'; end if;
  insert into public.assistant_conversations (id) values (p_id) on conflict do nothing;
end;
$$;

create or replace function public.assistant_append_message(p_conversation text, p_role text, p_text text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_role not in ('user', 'assistant') then raise exception 'invalid role' using errcode = '22023'; end if;
  if char_length(coalesce(p_text, '')) not between 1 and 2000 then raise exception 'invalid text' using errcode = '22023'; end if;
  if not exists (select 1 from public.assistant_conversations where id = p_conversation) then raise exception 'unknown conversation' using errcode = '22023'; end if;
  if (select count(*) from public.assistant_messages where conversation_id = p_conversation) >= 200 then raise exception 'conversation too long' using errcode = '22023'; end if;
  insert into public.assistant_messages (conversation_id, role, text) values (p_conversation, p_role, p_text) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.assistant_load_conversation(p_conversation text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  c record;
begin
  select * into c from public.assistant_conversations where id = p_conversation;
  if not found then return null; end if;
  return jsonb_build_object('startedAt', c.started_at, 'messages', coalesce((
    select jsonb_agg(jsonb_build_object('id', m.id, 'role', m.role, 'text', m.text, 'at', m.created_at) order by m.created_at)
    from (select * from public.assistant_messages where conversation_id = p_conversation order by created_at desc limit 40) m), '[]'::jsonb));
end;
$$;

-- The visitor can forget a conversation: its messages and its records go.
create or replace function public.assistant_forget_conversation(p_conversation text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_found boolean;
begin
  delete from public.assistant_events where conversation_id = p_conversation;
  delete from public.assistant_conversations where id = p_conversation;
  get diagnostics v_found = row_count;
  return v_found;
end;
$$;

create or replace function public.prune_assistant_messages(p_days integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not app_private.is_service() then raise exception 'Service role only' using errcode = '42501'; end if;
  delete from public.assistant_conversations where started_at < now() - make_interval(days => greatest(p_days, 1)) and not exists (select 1 from public.assistant_messages m where m.conversation_id = assistant_conversations.id and m.created_at >= now() - make_interval(days => greatest(p_days, 1)));
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke all on function public.assistant_start_conversation(text), public.assistant_append_message(text, text, text), public.assistant_load_conversation(text), public.assistant_forget_conversation(text) from public;
grant execute on function public.assistant_start_conversation(text), public.assistant_append_message(text, text, text), public.assistant_load_conversation(text), public.assistant_forget_conversation(text) to anon, authenticated, service_role;
revoke all on function public.prune_assistant_messages(integer) from public, anon, authenticated;
grant execute on function public.prune_assistant_messages(integer) to service_role;

-- Deleting a conversation through the service path now also removes its text.
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
  delete from public.assistant_conversations where id = p_conversation;
  return v_count;
end;
$$;
