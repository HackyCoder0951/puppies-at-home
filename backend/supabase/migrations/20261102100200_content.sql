-- B1 content: puppies, media, families, testimonials, faqs, site settings, plus the public read model (views).
create type public.puppy_sex as enum ('male', 'female', 'male-female');
create type public.puppy_origin as enum ('local', 'imported');
create type public.puppy_status as enum ('available', 'reserved', 'gone_home');
create type public.media_kind as enum ('photo', 'video');

create table public.puppies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text,                                   -- personal name; null or empty means the breed is shown as the name
  breed text not null,
  breeds text[] not null default '{}',         -- breed filter references (for example Maltipoo, Poodle)
  collections text[] not null default '{}',    -- for example Korean Teacup
  sex public.puppy_sex not null,
  age_text text not null,
  colour text,
  origin public.puppy_origin not null,
  status public.puppy_status not null default 'available',
  gone_home_source text check (gone_home_source in ('TeddyPups', 'Dubai showroom')),
  story text,
  price_minor bigint check (price_minor is null or price_minor >= 0),   -- internal only, never exposed by public views
  currency char(3) not null default 'AED',
  sort_order integer not null default 0,
  published_at timestamptz,
  gone_home_at timestamptz,
  deleted_at timestamptz,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index puppies_public_idx on public.puppies (status, sort_order, published_at desc) where published_at is not null and deleted_at is null;
create index puppies_search_idx on public.puppies using gin (breeds);

create table public.puppy_media (
  id uuid primary key default gen_random_uuid(),
  puppy_id uuid not null references public.puppies (id) on delete cascade,
  kind public.media_kind not null,
  storage_path text not null,
  poster_path text,                            -- still image for videos
  alt text not null default '',
  caption text,
  color text not null default '#f2be6b',      -- tone colour shown while the image loads
  focal_x numeric(4,3) not null default 0.5 check (focal_x between 0 and 1),
  focal_y numeric(4,3) not null default 0.5 check (focal_y between 0 and 1),
  width integer check (width > 0),
  height integer check (height > 0),
  duration_s numeric(8,3),
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index puppy_media_order_idx on public.puppy_media (puppy_id, sort_order);
create unique index puppy_media_one_cover on public.puppy_media (puppy_id) where is_cover;

create table public.families (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  alt text not null default '',
  caption text,
  color text not null default '#e8c8a8',
  width integer check (width > 0),
  height integer check (height > 0),
  sort_order integer not null default 0,
  release_ref text,                            -- written release for the people shown (docs/03 section 6.13)
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index families_public_idx on public.families (sort_order) where published_at is not null and deleted_at is null;

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author text not null,
  location text,
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index testimonials_one_featured on public.testimonials ((true)) where is_featured;

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index faqs_public_idx on public.faqs (sort_order) where published_at is not null and deleted_at is null;

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['puppies','puppy_media','families','testimonials','faqs','site_settings'] loop
    execute format('create trigger %I_updated before update on public.%I for each row execute function app_private.set_updated_at()', t, t);
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function app_private.audit_row()', t, t);
  end loop;
end $$;

-- Publishing needs its own permission: changing published_at (or status to gone_home) requires content.publish.
create or replace function app_private.guard_publish()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then return new; end if;   -- service role, migrations and seeds
  if tg_op = 'INSERT' then
    if new.published_at is not null and not app_private.has_permission('content.publish') then
      raise exception 'Publishing requires content.publish' using errcode = '42501';
    end if;
  elsif new.published_at is distinct from old.published_at and not app_private.has_permission('content.publish') then
    raise exception 'Publishing requires content.publish' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger puppies_publish before insert or update on public.puppies for each row execute function app_private.guard_publish();
create trigger families_publish before insert or update on public.families for each row execute function app_private.guard_publish();
create trigger faqs_publish before insert or update on public.faqs for each row execute function app_private.guard_publish();
create trigger testimonials_publish before insert or update on public.testimonials for each row execute function app_private.guard_publish();

-- Soft delete needs content.delete: operators may edit but not delete (docs/03 section 3).
create or replace function app_private.guard_soft_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and new.deleted_at is distinct from old.deleted_at and not app_private.has_permission('content.delete') then
    raise exception 'Deleting requires content.delete' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger puppies_soft_delete before update on public.puppies for each row execute function app_private.guard_soft_delete();
create trigger families_soft_delete before update on public.families for each row execute function app_private.guard_soft_delete();
create trigger faqs_soft_delete before update on public.faqs for each row execute function app_private.guard_soft_delete();

-- RLS: enabled and forced; staff policies per permission.
do $$
declare t text;
begin
  foreach t in array array['puppies','puppy_media','families','testimonials','faqs','site_settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;
grant delete on public.puppy_media, public.testimonials to authenticated;

create policy puppies_select on public.puppies for select to authenticated
  using ((select app_private.has_permission('content.read')) and (deleted_at is null or (select app_private.current_app_role()) = 'super_admin'));
create policy puppies_insert on public.puppies for insert to authenticated with check ((select app_private.has_permission('content.write')));
create policy puppies_update on public.puppies for update to authenticated
  using ((select app_private.has_permission('content.write'))) with check ((select app_private.has_permission('content.write')));

create policy puppy_media_select on public.puppy_media for select to authenticated using ((select app_private.has_permission('content.read')));
create policy puppy_media_insert on public.puppy_media for insert to authenticated with check ((select app_private.has_permission('content.write')));
create policy puppy_media_update on public.puppy_media for update to authenticated
  using ((select app_private.has_permission('content.write'))) with check ((select app_private.has_permission('content.write')));
create policy puppy_media_delete on public.puppy_media for delete to authenticated using ((select app_private.has_permission('content.write')));

create policy families_select on public.families for select to authenticated
  using ((select app_private.has_permission('content.read')) and (deleted_at is null or (select app_private.current_app_role()) = 'super_admin'));
create policy families_insert on public.families for insert to authenticated with check ((select app_private.has_permission('content.write')));
create policy families_update on public.families for update to authenticated
  using ((select app_private.has_permission('content.write'))) with check ((select app_private.has_permission('content.write')));

create policy testimonials_select on public.testimonials for select to authenticated using ((select app_private.has_permission('content.read')));
create policy testimonials_insert on public.testimonials for insert to authenticated with check ((select app_private.has_permission('content.write')));
create policy testimonials_update on public.testimonials for update to authenticated
  using ((select app_private.has_permission('content.write'))) with check ((select app_private.has_permission('content.write')));
create policy testimonials_delete on public.testimonials for delete to authenticated using ((select app_private.has_permission('content.delete')));

create policy faqs_select on public.faqs for select to authenticated
  using ((select app_private.has_permission('content.read')) and (deleted_at is null or (select app_private.current_app_role()) = 'super_admin'));
create policy faqs_insert on public.faqs for insert to authenticated with check ((select app_private.has_permission('content.write')));
create policy faqs_update on public.faqs for update to authenticated
  using ((select app_private.has_permission('content.write'))) with check ((select app_private.has_permission('content.write')));

-- Settings: staff read through settings.read; only super admins write.
create policy site_settings_select on public.site_settings for select to authenticated using ((select app_private.has_permission('settings.read')));
create policy site_settings_insert on public.site_settings for insert to authenticated with check ((select app_private.has_permission('settings.write')));
create policy site_settings_update on public.site_settings for update to authenticated
  using ((select app_private.has_permission('settings.write'))) with check ((select app_private.has_permission('settings.write')));

-- Public read model: whitelisted columns, published rows only, never the price. Views run as their owner (RLS on the base tables does not apply).
create view public.v_public_puppies as
select p.id, p.slug, p.name, p.breed, p.breeds, p.collections, p.sex, p.age_text, p.colour, p.origin, p.status, p.gone_home_source, p.sort_order, p.gone_home_at, p.published_at,
       exists (select 1 from public.puppy_media m where m.puppy_id = p.id and m.kind = 'video') as has_video
from public.puppies p
where p.published_at is not null and p.deleted_at is null;

create view public.v_public_puppy_media as
select m.id, m.puppy_id, p.slug as puppy_slug, m.kind, m.storage_path, m.poster_path, m.alt, m.caption, m.color, m.focal_x, m.focal_y, m.width, m.height, m.duration_s, m.sort_order, m.is_cover
from public.puppy_media m
join public.puppies p on p.id = m.puppy_id
where p.published_at is not null and p.deleted_at is null;

create view public.v_public_families as
select f.id, f.storage_path, f.alt, f.caption, f.color, f.width, f.height, f.sort_order
from public.families f
where f.published_at is not null and f.deleted_at is null;

create view public.v_public_faqs as
select q.id, q.question, q.answer, q.sort_order
from public.faqs q
where q.published_at is not null and q.deleted_at is null;

create view public.v_public_testimonial as
select t.id, t.quote, t.author, t.location
from public.testimonials t
where t.published_at is not null and t.is_featured;

create view public.v_public_settings as
select s.key, s.value
from public.site_settings s
where s.is_public;

grant select on public.v_public_puppies, public.v_public_puppy_media, public.v_public_families, public.v_public_faqs,
  public.v_public_testimonial, public.v_public_settings to anon, authenticated;
