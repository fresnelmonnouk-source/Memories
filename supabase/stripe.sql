-- ============================================================
-- MEMORIES — Stripe (abonnement 4 €/mois)
-- À exécuter dans Supabase SQL Editor APRÈS auth.sql.
-- subscription_status existe déjà sur profiles ('free' | 'active').
-- ============================================================

alter table public.profiles
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text;

create index if not exists profiles_stripe_customer_idx
  on public.profiles(stripe_customer_id);
