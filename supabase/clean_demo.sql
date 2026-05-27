-- ============================================================
-- MEMORIES — Nettoyage des données de DÉMO (seed)
-- À exécuter dans Supabase SQL Editor quand tu es prêt à mettre
-- le VRAI contenu (artistes + réalisations) via l'admin.
--
-- ⚠️ Cible UNIQUEMENT les slugs du seed d'origine → ne supprime PAS
-- les artistes/réalisations réels que tu auras ajoutés (slugs différents).
-- Le catalogue (tes 27 vrais motifs) n'est PAS touché.
-- ============================================================

-- Réalisations placeholder du seed
delete from public.realisations
where slug in (
  'back-piece-japonais-2026',
  'avant-bras-fineline-001',
  'blackwork-cuisse-002'
);

-- Artistes fictifs du seed (les FK tattoos/realisations/bookings passent à NULL automatiquement)
delete from public.artists
where slug in (
  'lea-sorin',
  'mateo-k',
  'anh-tran',
  'ryo-wada',
  'nina-vex',
  'diego-roth'
);

-- Filet de sécurité : motifs placeholder du seed initial s'il en reste
delete from public.tattoos where image_url = '/placeholder-tattoo.svg';

-- Vérif (à lancer séparément) :
-- select 'artists' as t, count(*) from public.artists
-- union all select 'realisations', count(*) from public.realisations;
