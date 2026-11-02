-- B1 foundation: extensions, private schema, shared helpers.
create extension if not exists pg_trgm with schema extensions;

create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to anon, authenticated, service_role;

-- Keeps updated_at current on every UPDATE.
create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Normalises a phone number to E.164 (digits with a leading plus), or returns null when it cannot be one.
create or replace function app_private.to_e164(raw text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v text;
begin
  if raw is null then return null; end if;
  v := regexp_replace(raw, '[\s().-]', '', 'g');
  if left(v, 2) = '00' then v := '+' || substr(v, 3); end if;
  if v ~ '^\+[1-9][0-9]{7,14}$' then return v; end if;
  return null;
end;
$$;
