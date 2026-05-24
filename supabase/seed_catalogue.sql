-- ============================================================
-- MEMORIES — Catalogue réel (27 motifs)
-- ============================================================
-- Remplace les 7 motifs placeholder du seed.sql par les vraies
-- images uploadées dans le bucket Storage public 'tattoos'.
--
-- PRÉREQUIS (à faire AVANT de lancer ce script) :
--   1. Bucket 'tattoos' existant et PUBLIC.
--   2. Les 27 fichiers uploadés à la RACINE du bucket 'tattoos'
--      (mêmes noms de fichiers que dans public/images/, sans sous-dossier).
--
-- ⚠️ À AJUSTER PAR FRESNEL (décisions business, je ne les décide pas) :
--   - base_price_eur : tous mis à 49.00 par défaut (= placeholder).
--   - style          : déduit du nom de fichier au mieux, à corriger si besoin.
--   - size_label     : tous 'M' par défaut.
--   - is_featured    : quelques-uns mis en avant, à toi de choisir.
--
-- Idempotent : on supprime d'abord les anciens placeholders et on
-- ré-insère avec `on conflict (slug) do update`.
-- ============================================================

begin;

-- 1. Retirer les 7 motifs placeholder du seed initial
delete from public.tattoos where image_url = '/placeholder-tattoo.svg';

-- 2. Insérer / mettre à jour les 27 motifs réels
insert into public.tattoos
  (slug, name, description, style, size_label, base_price_eur, image_url, tags, is_featured, display_order, is_active)
values
  ('petits-oiseaux',          'Petits oiseaux',           'Nuée de petits oiseaux en vol, trait fin.',                  'fine_line',       'M', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_157_Tatouage-ephemere-petits-oiseaux-1.png',                  array['oiseaux','fine line'],        false,  1, true),
  ('plumes-et-papillons',     'Plumes et papillons',      'Composition légère de plumes et de papillons.',              'fine_line',       'M', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_228_Tatouage-ephemere-plumes-et-papillons.png',              array['plumes','papillons'],         false,  2, true),
  ('marin',                   'Marin',                    'Motif marin old school.',                                    'neo_traditional', 'M', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_299_Tatouage-ephemere-marin.png',                            array['marin','old school'],         false,  3, true),
  ('tortue-maori',            'Tortue maori',             'Tortue aux motifs maori.',                                   'tribal',          'M', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_313_Tatouage-ephemere-tortue-maori.png',                     array['tortue','maori','tribal'],    false,  4, true),
  ('aigle-bw',                'Aigle noir & blanc',       'Aigle réaliste en noir et blanc.',                           'blackwork',       'L', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_340_Tatouage-ephemere-aigle-BW.png',                         array['aigle','blackwork'],          true,   5, true),
  ('scorpion-tribal',         'Scorpion tribal',          'Scorpion en lignes tribales pleines.',                       'tribal',          'M', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_411_Tatouage-ephemere-scorpion-tribal.png',                  array['scorpion','tribal'],          true,   6, true),
  ('roses-rouge-grand',       'Roses rouges (grand)',     'Bouquet de roses rouges, grand format.',                     'neo_traditional', 'L', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_416_Tatouage-ephemere-roses-rouge-768x768.jpg.png',          array['roses','couleur'],            false,  7, false),
  ('roses-rouge',             'Roses rouges',             'Roses rouges, couleur vive.',                                'neo_traditional', 'M', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_419_Tatouage-ephemere-roses-rouge.png',                      array['roses','couleur'],            false,  8, true),
  ('loup-hurlant',            'Loup hurlant',             'Loup hurlant, travail au noir.',                             'blackwork',       'M', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_473_Tatouage-ephemere-loup-hurlant.png',                     array['loup','blackwork'],           false,  9, true),
  ('bracelets-et-ornements',  'Bracelets et ornements',   'Bracelets ornementaux fins.',                                'fine_line',       'S', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_494_Tatouage-ephemere-bracelets-et-ornements.jpg.png',       array['ornement','bracelet'],        false, 10, true),
  ('rose-rubis',              'Rose rubis',               'Rose rouge intense, détail réaliste.',                       'neo_traditional', 'M', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_594_Tatouage-ephemere-rose-rubis.png',                       array['rose','couleur'],             false, 11, true),
  ('ange-de-la-mort',         'Ange de la mort',          'Figure sombre, ange de la mort.',                            'blackwork',       'L', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_607_Tatouage-ephemere-ange-de-la-mort.jpg',                  array['ange','dark'],                true,  12, true),
  ('rose-vs-temps',           'Rose contre le temps',     'Rose et symbolique du temps qui passe.',                     'neo_traditional', 'M', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_629_Tatouage-ephemere-rose-vs-temps.png',                    array['rose','temps'],               false, 13, true),
  ('la-chouette-cubique',     'La chouette cubique',      'Chouette en facettes géométriques.',                         'geometric',       'M', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_661_Tatouage-ephemere-la-chouette-cubique.png',              array['chouette','geometrique'],     false, 14, true),
  ('branche-de-fleurs-rouges','Branche de fleurs rouges', 'Branche fleurie aux pétales rouges.',                        'neo_traditional', 'M', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_733_Tatouage-ephemere-branche-de-fleurs-rouges.png',         array['fleurs','couleur'],           false, 15, true),
  ('petit-ganesha',           'Petit Ganesha',            'Ganesha stylisé, format compact.',                           'other',           'S', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_741_Tatouage-ephemere-petit-ganesha.jpg.png',                array['ganesha','spirituel'],        false, 16, true),
  ('tous-les-dieux',          'Tous les dieux',           'Composition iconographique de divinités.',                   'other',           'L', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_766_Tatouage-ephemere-tous-les-dieux.png',                   array['divinites','spirituel'],      false, 17, true),
  ('leopard-tribal',          'Léopard tribal',           'Léopard en motifs tribaux.',                                 'tribal',          'M', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_787_Tatouage-ephemere-leopard-tribal.png',                   array['leopard','tribal'],           false, 18, true),
  ('loup-dreamcatcher',       'Loup attrape-rêve',        'Loup intégré à un attrape-rêve.',                            'other',           'L', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_802_Tatouage-ephemere-loup-dreamcatcher.jpg.png',            array['loup','attrape-reve'],        false, 19, true),
  ('buffalo-santa-muerte',    'Buffalo Santa Muerte',     'Crâne de buffle, esthétique Santa Muerte.',                  'other',           'L', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_863_Tatouage-ephemere-buffalo-Santa-Muerte.png',             array['buffalo','santa muerte'],     false, 20, true),
  ('le-phenix-multicolore',   'Le phénix multicolore',    'Phénix flamboyant en couleurs vives.',                       'neo_traditional', 'L', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_871_Tatouage-ephemere-le-phenix-multicolore.png',            array['phenix','couleur'],           true,  21, true),
  ('batman',                  'Batman',                   'Logo / silhouette Batman.',                                  'other',           'S', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_925_Tatouage-ephemere-batman.png',                           array['batman','pop'],               false, 22, true),
  ('bras-intemporel',         'Bras intemporel',          'Composition de bras, pièce intemporelle.',                   'blackwork',       'XL', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_933_Tatouage-ephemere-bras-intemporel.png',                 array['bras','sleeve'],              false, 23, true),
  ('moineau-pack',            'Moineau (pack)',           'Pack de moineaux, trait fin.',                               'fine_line',       'S', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_946_Tatouage-ephemere-moineau-Pack.png',                     array['moineau','oiseau'],           false, 24, true),
  ('crane-noir-et-horloge',   'Crâne noir et horloge',    'Crâne et horloge, travail au noir.',                         'blackwork',       'L', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_958_Tatouage-ephemere-crane-noir-et-horloge.png',            array['crane','horloge'],            true,  25, true),
  ('attrape-reve-papillon',   'Attrape-rêve papillon',    'Attrape-rêve orné d''un papillon.',                          'fine_line',       'M', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_971_Tatouage-ephemere-attrape-reve-papillon.png',            array['attrape-reve','papillon'],    false, 26, true),
  ('crane-le-temps-qui-passe','Crâne — le temps qui passe','Crâne et symbolique du temps.',                             'blackwork',       'L', 49.00, 'https://ygbpmrvsgsetxgktosok.supabase.co/storage/v1/object/public/tattoos/imgi_985_Tatouage-ephemere-crane-le-temps-qui-passe.png',         array['crane','temps'],              false, 27, true)
on conflict (slug) do update set
  name           = excluded.name,
  description    = excluded.description,
  style          = excluded.style,
  size_label     = excluded.size_label,
  base_price_eur = excluded.base_price_eur,
  image_url      = excluded.image_url,
  tags           = excluded.tags,
  is_featured    = excluded.is_featured,
  display_order  = excluded.display_order,
  is_active      = excluded.is_active,
  updated_at     = now();

commit;

-- Vérification rapide (à lancer séparément si besoin) :
-- select display_order, name, style, is_active, image_url from public.tattoos order by display_order;
