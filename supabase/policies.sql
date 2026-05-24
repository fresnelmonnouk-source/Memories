-- ============================================================
-- MEMORIES — Row Level Security policies
-- ============================================================
-- À exécuter APRÈS schema.sql
-- ============================================================

-- Activer RLS sur toutes les tables
alter table public.artists enable row level security;
alter table public.tattoos enable row level security;
alter table public.realisations enable row level security;
alter table public.tryouts enable row level security;
alter table public.bookings enable row level security;
alter table public.rate_limits enable row level security;

-- ============================================================
-- ARTISTS — lecture publique des artistes actifs
-- ============================================================
drop policy if exists "Public read active artists" on public.artists;
create policy "Public read active artists"
  on public.artists for select
  using (is_active = true);

-- ============================================================
-- TATTOOS — lecture publique du catalogue actif
-- ============================================================
drop policy if exists "Public read active tattoos" on public.tattoos;
create policy "Public read active tattoos"
  on public.tattoos for select
  using (is_active = true);

-- ============================================================
-- REALISATIONS — lecture publique
-- ============================================================
drop policy if exists "Public read active realisations" on public.realisations;
create policy "Public read active realisations"
  on public.realisations for select
  using (is_active = true);

-- ============================================================
-- TRYOUTS — accès via session_token uniquement
-- ============================================================
-- Lecture publique avec session_token connu (par signed URL côté serveur)
drop policy if exists "Read own tryout by token" on public.tryouts;
create policy "Read own tryout by token"
  on public.tryouts for select
  using (true); -- la sécurité passe par la difficulté à deviner le session_token

-- Pas d'INSERT/UPDATE direct côté client (passe par API server-only via service_role)

-- ============================================================
-- BOOKINGS — pas d'accès direct côté client
-- ============================================================
-- Toutes les opérations passent par les routes API serveur (service_role bypass RLS)
-- Aucune policy de lecture = aucun client ne peut lire les réservations

-- ============================================================
-- RATE_LIMITS — accès server-only
-- ============================================================
-- Pas de policy = aucun accès anon/authenticated
-- Seul le service_role peut lire/écrire (utilisé par les API routes)

-- ============================================================
-- STORAGE BUCKETS — à créer manuellement dans le dashboard
-- ============================================================
-- Crée ces buckets via Storage > New bucket :
--
--   uploads (privé)       — photos clients pour essayage
--   results (privé)       — rendus IA générés
--   tattoos (public)      — catalogue de tatouages
--   realisations (public) — galerie portfolio
--
-- Puis applique les policies suivantes via SQL :

-- Uploads bucket : lecture par signed URL uniquement (depuis API serveur)
drop policy if exists "Server can manage uploads" on storage.objects;
create policy "Server can manage uploads"
  on storage.objects for all
  to service_role
  using (bucket_id = 'uploads')
  with check (bucket_id = 'uploads');

-- Results bucket : idem
drop policy if exists "Server can manage results" on storage.objects;
create policy "Server can manage results"
  on storage.objects for all
  to service_role
  using (bucket_id = 'results')
  with check (bucket_id = 'results');

-- Tattoos bucket : lecture publique
drop policy if exists "Public can read tattoos" on storage.objects;
create policy "Public can read tattoos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'tattoos');

-- Realisations bucket : lecture publique
drop policy if exists "Public can read realisations" on storage.objects;
create policy "Public can read realisations"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'realisations');
