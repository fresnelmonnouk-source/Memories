# 🚀 Checklist de lancement — Memories°

Ordre recommandé pour passer en production proprement. Coche au fur et à mesure.

---

## 1. Base de données (Supabase → SQL Editor)

Exécute dans cet ordre (ceux marqués ✅ sont normalement déjà faits) :

- [x] `supabase/schema.sql` — tables de base
- [x] `supabase/policies.sql` — RLS de base
- [x] `supabase/seed_catalogue.sql` — catalogue (27 motifs)
- [x] `supabase/auth.sql` — profils + rôles
- [x] `supabase/community_blog.sql` — communauté + blog
- [ ] **`supabase/legal.sql`** — table `site_content` (⚠️ requis pour : pages légales éditables **ET** tout le CMS `/admin/contenu`)
- [ ] **`supabase/community_moderation.sql`** — colonne `status` (⚠️ requis sinon **publier en communauté échoue**)
- [ ] **`supabase/freemium.sql`** — quotas + `tryouts.user_id` (sinon gating freemium inactif)
- [ ] `supabase/stripe.sql` — **seulement si** abonnement Stripe activé
- [ ] `supabase/clean_demo.sql` — **en dernier**, quand le vrai contenu est prêt (supprime les 6 artistes fictifs + 3 réalisations placeholder)

## 2. Supabase — configuration

- [ ] **Authentication → Providers → Email** = activé
- [ ] Décider « Confirm email » : ON (sécurisé, nécessite SMTP) ou OFF (plus simple). Pour la prod, recommandé ON + SMTP Resend.
- [ ] Vérifier les **buckets** : `uploads` (privé), `results` (privé), `tattoos` (public), `realisations` (public)

## 3. Compte administrateur

- [ ] Créer ton compte via **/inscription**
- [ ] Le passer admin (SQL) :
  ```sql
  update public.profiles set role = 'admin' where email = 'TON_EMAIL';
  ```
- [ ] Vérifier l'accès à **/admin**

## 4. Variables d'environnement (Vercel → Settings → Environment Variables)

**Indispensables :**
- [x] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [x] `GEMINI_API_KEY` (+ facturation Gemini activée)
- [x] `DEEPSEEK_API_KEY` (assistant)
- [ ] `NEXT_PUBLIC_APP_URL` = **`https://ton-domaine`** (⚠️ avec https://, sert au SEO/OG + emails + Stripe)
- [ ] `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL` (emails de réservation ; from = domaine vérifié chez Resend, ou `onboarding@resend.dev` en test)
- [ ] `CRON_SECRET` (nettoyage RGPD auto des essayages — `openssl rand -hex 32`)

**Optionnels :**
- [ ] `OPENAI_API_KEY` (fallback génération si Gemini sature)
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (si abonnement)

## 5. Stripe (uniquement si abonnement 4 €/mois)

- [ ] ⚠️ Vérifier la **faisabilité** : Stripe n'accepte pas de compte marchand au **Togo** → entité dans un pays supporté, sinon **FedaPay/PayDunya**.
- [ ] Créer un **Produit** + **Prix récurrent mensuel 4 €** → copier l'ID dans `STRIPE_PRICE_ID`
- [ ] Webhook : endpoint `https://ton-domaine/api/stripe/webhook`, events `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` → copier le secret dans `STRIPE_WEBHOOK_SECRET`
- [ ] Exécuter `supabase/stripe.sql`

## 6. Contenu réel (via l'admin)

- [ ] **Artistes** : remplacer les fictifs par les vrais (nom, bio, **portrait**) — `/admin/artistes`
- [ ] **Réalisations** : ajouter de vraies photos (avec accord client) — `/admin/realisations`
- [ ] **Image démo hero** (avant/après) — `/admin/contenu`
- [ ] **Tarifs / FAQ / soins** : vérifier/ajuster — `/admin/contenu`
- [ ] **Textes légaux** : ⚖️ FAIRE RELIRE (RCCM, contact, acompte, annulation, hébergeur) — `/admin/legal`
- [ ] Lancer `clean_demo.sql` une fois le vrai contenu en place

## 7. Domaine & déploiement

- [ ] Acheter le domaine + l'ajouter dans **Vercel → Domains** + configurer le DNS
- [ ] Mettre `NEXT_PUBLIC_APP_URL` à jour avec le domaine final
- [ ] Vérifier que le dernier déploiement est **Ready** (vert)

## 8. Tests fonctionnels (sur le domaine de prod)

- [ ] **Home** : hero + démo avant/après + marquee + sections
- [ ] **Catalogue** : les motifs s'affichent
- [ ] **Essayage** : upload 2 photos → 2 rendus → avant/après → **télécharger**
- [ ] **Freemium** : 1 essai anonyme (navigation privée) → 2e bloqué (compte) → après compte 2 essais → 3e = paywall /abonnement
- [ ] **Auth** : inscription, connexion, déconnexion, /compte, /admin (rôle)
- [ ] **Communauté** : publier (post normal = visible ; post douteux = en validation) + modération admin
- [ ] **Blog** : créer un article admin → visible sur /journal
- [ ] **Réservation** : formulaire + **consentement photos** → email reçu (PJ si consenti)
- [ ] **Assistant** : la bulle répond (DeepSeek)
- [ ] **Légal** : /legal/mentions-legales, /confidentialite, /cgv + **bandeau cookies**
- [ ] **Mobile** : tout vérifier sur téléphone (≥70 % du trafic attendu)

## 9. Sécurité & RGPD (rappels)

- [ ] `.env.local` jamais commité (✅ gitignoré)
- [ ] Surveiller les **faux positifs de modération sur peau foncée** (cible Togo) — ajuster le prompt si besoin
- [ ] Vérifier le nettoyage auto des essayages (cron quotidien `/api/cron/cleanup-tryouts`)

---

### Récap des prérequis bloquants AVANT d'ouvrir au public
1. `legal.sql` + `community_moderation.sql` + `freemium.sql` exécutés
2. `NEXT_PUBLIC_APP_URL` = domaine final
3. Vrais artistes/réalisations + relecture légale
4. Tests fonctionnels passés sur le domaine
