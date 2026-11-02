-- B3 admin foundation: server-side audit of authentication events (sign in, failed sign in, sign out, password reset).
-- Callable by the service role only; the application layer hashes the IP and never passes secrets.
create or replace function public.record_audit_event(p_actor uuid, p_action text, p_entity text, p_entity_id text default null, p_meta jsonb default null, p_ip_hash text default null, p_user_agent text default null)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.audit_log (actor_id, action, entity, entity_id, after, ip_hash, user_agent)
  values (p_actor, p_action, p_entity, p_entity_id, p_meta, p_ip_hash, left(p_user_agent, 300));
$$;
revoke all on function public.record_audit_event(uuid, text, text, text, jsonb, text, text) from public, anon, authenticated;
grant execute on function public.record_audit_event(uuid, text, text, text, jsonb, text, text) to service_role;
