-- ============================================================
-- MEMORIES — Modération communauté
-- À exécuter dans Supabase SQL Editor APRÈS community_blog.sql.
-- ============================================================

-- Statut de modération : 'approved' (public) | 'flagged' (caché, en revue admin)
alter table public.community_posts
  add column if not exists status text not null default 'approved'
  check (status in ('approved', 'flagged'));

create index if not exists community_posts_status_idx
  on public.community_posts(status, created_at desc);

-- Lecture publique RESTREINTE aux posts approuvés.
-- (L'admin lit les 'flagged' côté serveur via service_role.)
drop policy if exists "community_select_all" on public.community_posts;
drop policy if exists "community_select_approved" on public.community_posts;
create policy "community_select_approved" on public.community_posts
  for select using (status = 'approved');
