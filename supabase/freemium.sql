-- ============================================================
-- MEMORIES — Freemium (gating des essayages)
-- À exécuter dans Supabase SQL Editor APRÈS schema.sql + auth.sql.
-- Règle : 1 essai gratuit/appareil (IP) sans compte → compte obligatoire
--         → 2 essais gratuits/compte → abonnement (Stripe, sprint suivant).
-- ============================================================

-- Compteur À VIE par IP (ne se réinitialise pas comme tryout_count quotidien)
alter table public.rate_limits
  add column if not exists lifetime_tryout_count int not null default 0;

-- Lien essayage → compte (remplit « Mes essayages » du dashboard client)
alter table public.tryouts
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists tryouts_user_idx on public.tryouts(user_id, created_at desc);

-- Incrémente le compteur à vie d'une IP (crée la ligne si absente)
create or replace function public.bump_lifetime_tryout(p_ip text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.rate_limits (ip_address, lifetime_tryout_count, first_seen_at, last_seen_at)
  values (p_ip, 1, now(), now())
  on conflict (ip_address) do update
    set lifetime_tryout_count = public.rate_limits.lifetime_tryout_count + 1,
        last_seen_at = now();
end;
$$;
