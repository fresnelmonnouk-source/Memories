# Memories° — Runbook de setup (Sprint 1)

> Checklist d'installation de l'infra. Étapes **manuelles** (comptes externes + clés).
> Validé par KODY le 2026-05-24. Suis l'ordre.

## 0. Prérequis local (déjà fait ✅)
- `npm install` → `found 0 vulnerabilities`
- `npm run build` → vert (14 routes)
- Le build passe **sans** `.env.local` (init Gemini paresseuse). Mais `npm run dev` + le runtime ont besoin des vraies clés ci-dessous.

---

## 1. Créer le projet Supabase 🔴
1. https://supabase.com/dashboard → **New project**
2. Région : **Europe (West) — eu-west** (proche du Togo via Paris)
3. Note le mot de passe DB (coffre-fort)
4. Attends la fin du provisioning (~2 min)

## 2. Exécuter les SQL dans l'ordre 🔴
**SQL Editor** → coller/exécuter, **un fichier à la fois**, dans cet ordre :
1. `supabase/schema.sql`  → crée enums, 6 tables, index, fonctions, triggers
2. `supabase/policies.sql` → active RLS + policies tables & storage
3. `supabase/seed.sql`     → données de démo (optionnel mais recommandé pour tester l'UI)

✅ Aucune erreur attendue. `seed.sql` est ré-exécutable (`on conflict do nothing`).

## 3. Créer les 4 buckets Storage 🔴
**Storage → New bucket** (le nom doit être EXACT) :

| Bucket | Visibilité | Contenu |
|--------|-----------|---------|
| `uploads` | **Privé** | photos clients (TTL signé 24h) |
| `results` | **Privé** | rendus IA (TTL signé 7j) |
| `tattoos` | **Public** | catalogue |
| `realisations` | **Public** | portfolio |

> Les policies storage sont déjà posées par `policies.sql` (étape 2) — pas d'action SQL supplémentaire. Si tu as créé les buckets APRÈS avoir lancé policies.sql, c'est OK (les policies filtrent par nom de bucket).

## 4. Récupérer les clés Supabase 🔴
**Project Settings → API** :
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` ⚠️ secret → `SUPABASE_SERVICE_ROLE_KEY` (jamais côté client)

## 5. Gemini (Nano Banana) 🔴
1. https://aistudio.google.com/apikey → créer une clé → `GEMINI_API_KEY`
2. **Activer la facturation** (le free tier ne suffit pas pour une beta publique)
3. Recommandé : cap budget mensuel GCP à **50 €** pendant la beta
4. Modèles (défauts OK) : `GEMINI_IMAGE_MODEL=gemini-2.5-flash-image`, `GEMINI_MODERATION_MODEL=gemini-2.5-flash`

## 6. Resend (emails) 🔴
1. https://resend.com/api-keys → clé → `RESEND_API_KEY`
2. Dev : `RESEND_FROM_EMAIL=onboarding@resend.dev` fonctionne sans domaine
3. Prod : vérifier un domaine → `atelier@<domaine>` + `RESEND_TO_EMAIL=studio@<domaine>`

## 7. Créer `.env.local` 🔴
Copier `.env.example` → `.env.local` et remplir les 8 variables ci-dessus.
(Le fichier est gitignoré — jamais commité.)

## 8. Lancer et tester 🔴
```bash
npm run dev          # http://localhost:3000
```
Flow à valider :
1. `/` → `/essayage`
2. Upload 2 photos (plan large + gros plan) → modération Gemini
3. Choix zone/taille + motif catalogue → « Lancer l'IA »
4. 2 rendus en 15-30s
5. « Réserver » → `/reservation` (tryout joint) → soumettre
6. Vérifier les 2 emails Resend (client + studio)

---

## Notes / pièges
- **Modération peau foncée** : surveiller les faux positifs (sous-estimation d'âge) vu la cible Togo — calibrer sur les 1ers cas réels (cf. `docs/04_INTEGRATION_IA.md §5`).
- **Latence** : `/api/tryout` a `maxDuration = 60`. Sur Vercel Hobby le timeout fonction est 60s → OK ; surveiller en charge.
- **Coût** : ~0,039 $/image, 2 images/tryout. ~16 €/mois à 200 tryouts.
- **Adresse studio** : placeholder « Adidogomé » dans seed/footer → à confirmer avec le client.

## Reste à brancher après ce runbook
- Vraies images (artistes / catalogue / réalisations) → buckets + MAJ `image_url`/`portrait_url`
- Déploiement Vercel + variables d'env (Production + Preview) + région `cdg1`
- Domaine + DNS + domaine vérifié Resend
