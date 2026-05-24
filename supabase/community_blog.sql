-- ============================================================
-- MEMORIES — Communauté + Mini-blog
-- À exécuter dans Supabase SQL Editor APRÈS schema.sql + auth.sql.
-- ============================================================

-- ============ Communauté (tous les comptes peuvent publier) ============
create table if not exists public.community_posts (
  id          uuid primary key default uuid_generate_v4(),
  author_id   uuid references auth.users(id) on delete set null,
  author_name text not null,
  body        text not null check (char_length(body) between 1 and 2000),
  created_at  timestamptz default now()
);

create index if not exists community_posts_created_idx on public.community_posts(created_at desc);

alter table public.community_posts enable row level security;

-- Lecture publique
drop policy if exists "community_select_all" on public.community_posts;
create policy "community_select_all" on public.community_posts for select using (true);

-- Tout utilisateur connecté peut publier SON post
drop policy if exists "community_insert_own" on public.community_posts;
create policy "community_insert_own" on public.community_posts
  for insert with check (auth.uid() = author_id);

-- Suppression : faite côté serveur via service_role (admin) → pas de policy delete.

-- ============ Mini-blog (géré par l'admin) ============
create table if not exists public.blog_posts (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,
  title        text not null,
  excerpt      text,
  body         text not null,
  cover_url    text,
  is_published boolean not null default true,
  published_at timestamptz default now(),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists blog_posts_pub_idx on public.blog_posts(is_published, published_at desc);

alter table public.blog_posts enable row level security;

-- Lecture publique des articles publiés uniquement
drop policy if exists "blog_select_published" on public.blog_posts;
create policy "blog_select_published" on public.blog_posts
  for select using (is_published = true);

-- Écriture (create/update/delete) : 100% côté serveur via service_role (admin) → pas de policy.

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.handle_updated_at();
