-- ============================================================
-- MEMORIES — Schema Supabase
-- ============================================================
-- À exécuter dans le SQL Editor de Supabase, dans cet ordre :
--   1. schema.sql (ce fichier)
--   2. policies.sql
--   3. seed.sql (optionnel)
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type tattoo_style as enum (
    'fine_line', 'blackwork', 'neo_traditional', 'japanese',
    'realism', 'geometric', 'minimalist', 'tribal', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type body_zone as enum (
    'forearm', 'full_arm', 'shoulder', 'back', 'chest',
    'thigh', 'calf', 'ankle', 'ribs', 'neck', 'hand', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type tryout_status as enum ('pending', 'generating', 'done', 'failed', 'flagged');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('new', 'contacted', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ============================================================
-- TABLE: artists
-- ============================================================
create table if not exists public.artists (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  bio text,
  years_experience int default 0,
  primary_style tattoo_style,
  styles tattoo_style[] default '{}',
  portrait_url text,
  instagram text,
  is_active boolean default true,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists artists_active_idx on public.artists(is_active, display_order);

-- ============================================================
-- TABLE: tattoos (catalogue)
-- ============================================================
create table if not exists public.tattoos (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  style tattoo_style,
  size_label text, -- 'XS', 'S', 'M', 'L', 'XL'
  base_price_eur numeric(10,2),
  image_url text not null, -- bucket public 'tattoos'
  thumbnail_url text,
  tags text[] default '{}',
  artist_id uuid references public.artists(id) on delete set null,
  is_featured boolean default false,
  is_active boolean default true,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists tattoos_active_idx on public.tattoos(is_active, display_order);
create index if not exists tattoos_style_idx on public.tattoos(style);
create index if not exists tattoos_artist_idx on public.tattoos(artist_id);

-- ============================================================
-- TABLE: realisations (travaux réalisés / portfolio)
-- ============================================================
create table if not exists public.realisations (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  description text,
  artist_id uuid references public.artists(id) on delete set null,
  style tattoo_style,
  body_zone body_zone,
  image_url text not null, -- bucket public 'realisations'
  thumbnail_url text,
  realized_at date,
  is_featured boolean default false,
  is_active boolean default true,
  display_order int default 0,
  created_at timestamptz default now()
);

create index if not exists realisations_active_idx on public.realisations(is_active, display_order);

-- ============================================================
-- TABLE: tryouts (sessions d'essayage IA)
-- ============================================================
create table if not exists public.tryouts (
  id uuid primary key default uuid_generate_v4(),
  session_token text unique not null default encode(gen_random_bytes(16), 'hex'),

  -- Photos client (bucket privé 'uploads')
  body_wide_path text,     -- plan large
  body_close_path text,    -- gros plan

  -- Tatouage utilisé
  tattoo_id uuid references public.tattoos(id) on delete set null,
  custom_tattoo_path text, -- si upload custom

  -- Zone du corps
  body_zone body_zone,
  size_label text,

  -- Résultats IA (bucket privé 'results')
  result_wide_path text,
  result_close_path text,

  -- Statut & meta
  status tryout_status default 'pending',
  error_message text,
  moderation_passed boolean,
  moderation_reason text,

  -- Stats
  generation_ms int,
  model_used text,
  prompt_used text,

  -- Tracking optionnel
  ip_address inet,
  user_agent text,
  email text, -- si client a saisi son email

  created_at timestamptz default now(),
  completed_at timestamptz,
  expires_at timestamptz default (now() + interval '30 days')
);

create index if not exists tryouts_session_idx on public.tryouts(session_token);
create index if not exists tryouts_email_idx on public.tryouts(email);
create index if not exists tryouts_status_idx on public.tryouts(status);
create index if not exists tryouts_expires_idx on public.tryouts(expires_at);

-- ============================================================
-- TABLE: bookings (réservations)
-- ============================================================
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),

  -- Coordonnées client
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,

  -- Projet
  preferred_artist_id uuid references public.artists(id) on delete set null,
  body_zone body_zone,
  project_description text,

  -- Lien vers un essayage IA si fait
  tryout_id uuid references public.tryouts(id) on delete set null,

  -- Statut
  status booking_status default 'new',
  internal_notes text,

  -- Confirmation
  confirmation_token text unique default encode(gen_random_bytes(16), 'hex'),

  -- Tracking
  ip_address inet,
  user_agent text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  contacted_at timestamptz,
  confirmed_at timestamptz
);

create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_email_idx on public.bookings(email);
create index if not exists bookings_created_idx on public.bookings(created_at desc);

-- ============================================================
-- TABLE: rate_limits (anti-abus IA)
-- ============================================================
create table if not exists public.rate_limits (
  ip_address inet primary key,
  tryout_count int default 0,
  upload_count int default 0,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  blocked_until timestamptz
);

create index if not exists rate_limits_blocked_idx on public.rate_limits(blocked_until);

-- ============================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists artists_updated_at on public.artists;
create trigger artists_updated_at before update on public.artists
  for each row execute function public.handle_updated_at();

drop trigger if exists tattoos_updated_at on public.tattoos;
create trigger tattoos_updated_at before update on public.tattoos
  for each row execute function public.handle_updated_at();

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.handle_updated_at();

-- ============================================================
-- FONCTIONS UTILITAIRES
-- ============================================================

-- Nettoyage automatique des essayages expirés
create or replace function public.cleanup_expired_tryouts()
returns int as $$
declare
  deleted_count int;
begin
  delete from public.tryouts where expires_at < now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$ language plpgsql security definer;

-- Incrémenter compteur rate-limit AVEC reset quotidien (UTC).
-- Si le dernier accès date d'un jour antérieur, les compteurs repartent de 0
-- avant d'appliquer l'incrément → la limite est bien « par jour », pas « à vie ».
create or replace function public.bump_rate_limit(p_ip inet, p_kind text)
returns void as $$
begin
  insert into public.rate_limits (ip_address, tryout_count, upload_count)
  values (
    p_ip,
    case when p_kind = 'tryout' then 1 else 0 end,
    case when p_kind = 'upload' then 1 else 0 end
  )
  on conflict (ip_address) do update set
    tryout_count =
      (case when public.rate_limits.last_seen_at::date < current_date
            then 0 else public.rate_limits.tryout_count end)
      + (case when p_kind = 'tryout' then 1 else 0 end),
    upload_count =
      (case when public.rate_limits.last_seen_at::date < current_date
            then 0 else public.rate_limits.upload_count end)
      + (case when p_kind = 'upload' then 1 else 0 end),
    last_seen_at = now();
end;
$$ language plpgsql security definer;
