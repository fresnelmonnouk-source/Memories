-- ============================================================
-- MEMORIES — Contenu éditable (pages légales, etc.)
-- À exécuter dans Supabase SQL Editor APRÈS schema.sql.
-- Les textes par défaut vivent dans le code (src/lib/legal.ts) ; cette table
-- stocke uniquement les versions ÉDITÉES depuis l'admin. Tant qu'une clé n'est
-- pas éditée, la page affiche le texte par défaut du code.
-- ============================================================

create table if not exists public.site_content (
  key        text primary key,           -- ex: 'legal_mentions', 'legal_confidentialite', 'legal_cgv'
  title      text not null,
  body       text not null,
  updated_at timestamptz default now()
);

alter table public.site_content enable row level security;

-- Lecture publique
drop policy if exists "site_content_select_all" on public.site_content;
create policy "site_content_select_all" on public.site_content for select using (true);

-- Écriture (upsert) via service_role (admin) → pas de policy.

drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at
  before update on public.site_content
  for each row execute function public.handle_updated_at();
