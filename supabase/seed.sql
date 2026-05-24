-- ============================================================
-- MEMORIES — Données de démo
-- ============================================================
-- Optionnel : remplit le catalogue avec des données de démo
-- À exécuter APRÈS schema.sql + policies.sql
-- ============================================================

-- Artistes
insert into public.artists (slug, name, bio, years_experience, primary_style, styles, display_order, is_active) values
  ('lea-sorin',  'Léa Sorin',  'Spécialiste fine line et lettering. Travaille à l''aiguille unique pour des compositions délicates et persistantes.', 7,  'fine_line',       array['fine_line', 'minimalist']::tattoo_style[], 1, true),
  ('mateo-k',    'Mateo K.',   'Maître du blackwork géométrique et des compositions architecturales en noir profond.', 12, 'blackwork',       array['blackwork', 'geometric']::tattoo_style[], 2, true),
  ('anh-tran',   'Anh Tran',   'Néo-traditionnel et couleurs vives. Influences botaniques et iconographie hybride.', 9,  'neo_traditional', array['neo_traditional']::tattoo_style[], 3, true),
  ('ryo-wada',   'Ryo Wada',   'Style japonais traditionnel (Irezumi) et grandes pièces sur corps complet.', 15, 'japanese',        array['japanese']::tattoo_style[], 4, true),
  ('nina-vex',   'Nina Vex',   'Fine line ornemental, motifs floraux et symbolique alchimique.', 5,  'fine_line',       array['fine_line', 'minimalist']::tattoo_style[], 5, true),
  ('diego-roth', 'Diego Roth', 'Blackwork brut et compositions tribales contemporaines.', 11, 'blackwork',       array['blackwork', 'tribal']::tattoo_style[], 6, true)
on conflict (slug) do nothing;

-- Tatouages catalogue (image_url à remplacer par les vraies images après upload dans le bucket)
insert into public.tattoos (slug, name, description, style, size_label, base_price_eur, image_url, tags, is_featured, display_order, is_active) values
  ('flamme-24',    'Flamme №24',     'Flamme stylisée, contour noir épais, point rouge central',                       'blackwork',       'S',  120.00, '/placeholder-tattoo.svg', array['flamme','symbol'],      true,  1, true),
  ('vague-11',     'Vague №11',      'Double vague inspirée de l''estampe japonaise, trait fin',                         'japanese',        'M',  180.00, '/placeholder-tattoo.svg', array['vague','eau','japon'],  true,  2, true),
  ('pyramide',     'Pyramide',       'Pyramide géométrique, double contour',                                            'geometric',       'S',  100.00, '/placeholder-tattoo.svg', array['geo','pyramide'],       false, 3, true),
  ('soleil',       'Soleil',         'Cercles concentriques avec point central rouge',                                  'geometric',       'M',  140.00, '/placeholder-tattoo.svg', array['soleil','minimal'],     true,  4, true),
  ('arche',        'Arche',          'Arche architecturale néo-romaine',                                                'geometric',       'L',  200.00, '/placeholder-tattoo.svg', array['arche','archi'],        false, 5, true),
  ('etoile-8',     'Étoile à 8',     'Étoile à huit branches, dessin filaire',                                          'minimalist',      'XS',  80.00, '/placeholder-tattoo.svg', array['etoile','symbol'],      false, 6, true),
  ('oeil',         'Œil',            'Œil stylisé, paupière arquée',                                                    'fine_line',       'S',  130.00, '/placeholder-tattoo.svg', array['oeil','symbol'],        false, 7, true)
on conflict (slug) do nothing;

-- Quelques réalisations (à remplacer par vraies photos)
insert into public.realisations (slug, title, description, style, body_zone, image_url, is_featured, display_order, is_active) values
  ('back-piece-japonais-2026', 'Back piece japonais',     'Composition complète dos, dragon et pivoines',     'japanese',     'back',    '/placeholder-real.svg', true,  1, true),
  ('avant-bras-fineline-001',  'Sleeve fine line',        'Composition botanique avant-bras',                 'fine_line',    'forearm', '/placeholder-real.svg', true,  2, true),
  ('blackwork-cuisse-002',     'Blackwork géométrique',   'Composition triangulaire cuisse',                  'blackwork',    'thigh',   '/placeholder-real.svg', false, 3, true)
on conflict (slug) do nothing;
