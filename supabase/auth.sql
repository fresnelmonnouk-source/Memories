-- ============================================================
-- MEMORIES — Auth & profils (Sprint 1)
-- À exécuter dans Supabase SQL Editor APRÈS schema.sql.
-- Prérequis dashboard : Authentication → Providers → Email = ON.
-- (Pour tester vite en dev : désactiver "Confirm email", ou configurer SMTP.)
-- ============================================================

-- Rôle utilisateur
do $$ begin
  create type user_role as enum ('client', 'admin');
exception when duplicate_object then null; end $$;

-- Profil applicatif, 1-1 avec auth.users
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  email                text,
  display_name         text,
  role                 user_role not null default 'client',
  -- Essais consommés DEPUIS la création du compte (le 1er essai anonyme est compté par IP via rate_limits)
  account_tryouts_used int not null default 0,
  -- 'free' | 'active' (passera à 'active' avec l'abonnement Stripe, sprint ultérieur)
  subscription_status  text not null default 'free',
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

alter table public.profiles enable row level security;

-- Chacun lit / met à jour SON profil (les admins passent par le service_role côté serveur)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- updated_at auto (réutilise handle_updated_at de schema.sql si présent)
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- APRÈS avoir créé ton compte propriétaire via le site (/inscription),
-- passe-le admin (remplace l'email) :
--   update public.profiles set role = 'admin' where email = 'TON_EMAIL';
-- ============================================================
