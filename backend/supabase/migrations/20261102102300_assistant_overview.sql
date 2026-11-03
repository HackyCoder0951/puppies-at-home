-- Reviewer overview for the assistant (decision D22: super admins read redacted text; every read is a function call under audit.read).
create or replace function public.assistant_overview(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_since timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 365)));
begin
  perform app_private.require_permission('audit.read');
  return jsonb_build_object(
    'days', greatest(1, least(coalesce(p_days, 30), 365)),
    'turns', (select count(*) from public.assistant_events where kind = 'turn' and created_at >= v_since),
    'outcomes', coalesce((select jsonb_object_agg(o, c) from (select data ->> 'outcome' as o, count(*) as c from public.assistant_events where kind = 'turn' and created_at >= v_since group by 1) x), '{}'::jsonb),
    'feedback', coalesce((select jsonb_object_agg(k, c) from (select data ->> 'kind' as k, count(*) as c from public.assistant_events where kind = 'feedback' and created_at >= v_since group by 1) x), '{}'::jsonb),
    'modes', coalesce((select jsonb_object_agg(m, c) from (select coalesce(data -> 'policy' ->> 'mode', 'fixed') as m, count(*) as c from public.assistant_events where kind = 'turn' and created_at >= v_since group by 1) x), '{}'::jsonb),
    'avgLatencyMs', (select round(avg((data ->> 'latencyMs')::numeric)) from public.assistant_events where kind = 'turn' and created_at >= v_since),
    'tokens', jsonb_build_object('in', (select coalesce(sum((data ->> 'inputTokens')::bigint), 0) from public.assistant_events where kind = 'turn' and created_at >= v_since), 'out', (select coalesce(sum((data ->> 'outputTokens')::bigint), 0) from public.assistant_events where kind = 'turn' and created_at >= v_since)),
    'conversations', coalesce((select jsonb_agg(c order by c ->> 'startedAt' desc) from (
      select jsonb_build_object('id', ac.id, 'startedAt', ac.started_at, 'messages', coalesce((select jsonb_agg(jsonb_build_object('role', m.role, 'text', m.text, 'at', m.created_at) order by m.created_at) from public.assistant_messages m where m.conversation_id = ac.id), '[]'::jsonb)) as c
      from public.assistant_conversations ac where ac.started_at >= v_since order by ac.started_at desc limit 15) y), '[]'::jsonb));
end;
$$;
revoke all on function public.assistant_overview(integer) from public, anon;
grant execute on function public.assistant_overview(integer) to authenticated, service_role;
