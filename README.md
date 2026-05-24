# Memories — Studio de tatouage avec essayage IA

Application Next.js 15 pour le studio de tatouage **Memories**. Permet aux clients d'essayer virtuellement un tatouage avant de réserver, grâce à l'IA Gemini (Nano Banana).

## Stack

- **Next.js 15** (App Router, Server Actions, React 19)
- **TypeScript**
- **Supabase** — Postgres + Storage + Auth
- **Gemini API** (Nano Banana / Gemini 2.5 Flash Image) — génération des essayages
- **Resend** — emails de booking
- **CSS Modules** + variables CSS (pas de Tailwind, design 100% custom)

## Installation

### 1. Cloner & installer

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Récupérer l'URL et les clés depuis **Project Settings → API**
3. Dans le SQL Editor, lancer dans cet ordre :
   - `supabase/schema.sql` — crée les tables
   - `supabase/policies.sql` — active la sécurité RLS
   - `supabase/seed.sql` — données de démo (optionnel)
4. Créer les buckets Storage :
   - `uploads` (privé) — photos clients
   - `results` (privé) — rendus IA
   - `tattoos` (public) — catalogue de tatouages
   - `realisations` (public) — galerie des réalisations

### 3. Gemini API

1. Récupérer une clé sur [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Activer la facturation pour passer du free tier (rate-limited) au tier payant
3. Coller dans `GEMINI_API_KEY`

### 4. Resend (emails)

1. Créer un compte sur [resend.com](https://resend.com)
2. Vérifier ton domaine ou utiliser le domaine de dev
3. Récupérer la clé API

### 5. Lancer

```bash
npm run dev
```

→ http://localhost:3000

## Structure du projet

```
memories-tattoo/
├── src/
│   ├── app/                    # Routes Next.js (App Router)
│   │   ├── page.tsx            # Home
│   │   ├── essayage/           # Essayage IA
│   │   ├── catalogue/          # Catalogue de tatouages
│   │   ├── realisations/       # Galerie travaux réalisés
│   │   ├── artistes/           # Profils artistes
│   │   ├── a-propos/           # Manifesto & studio
│   │   ├── reservation/        # Booking
│   │   └── api/                # API Routes
│   │       ├── tryout/         # Génération IA (Nano Banana)
│   │       ├── upload/         # Upload photos clients
│   │       ├── booking/        # Création réservation
│   │       └── moderate/       # Modération images
│   ├── components/             # Composants React
│   │   ├── ui/                 # Layout: nav, footer, cursor, marquee
│   │   ├── home/               # Sections de la home
│   │   ├── tryon/              # Composants du laboratoire IA
│   │   └── booking/            # Formulaire de réservation
│   ├── lib/
│   │   ├── supabase/           # Clients Supabase (browser/server/admin)
│   │   ├── gemini/             # Wrapper Gemini API
│   │   └── utils.ts
│   ├── styles/                 # CSS globaux + variables
│   └── types/                  # Types TypeScript
├── supabase/                   # Migrations SQL
│   ├── schema.sql
│   ├── policies.sql
│   └── seed.sql
└── public/                     # Assets statiques
```

## Le flow d'essayage IA

1. Client va sur `/essayage`
2. Upload deux photos (plan large + gros plan) → `POST /api/upload`
3. Les photos passent par `/api/moderate` (vérif contenu approprié)
4. Choix d'un tatouage (catalogue) ou upload custom
5. `POST /api/tryout` → appelle Gemini Nano Banana 2 fois (plan large + gros plan)
6. Résultats sauvegardés dans Supabase, URLs signées retournées au client
7. Si validation → `POST /api/booking` avec lien vers l'essayage

## Coûts estimés (200 essayages/mois)

| Service | Coût |
|---|---|
| Vercel | 0 € (free tier) |
| Supabase | 0 € (free tier 500MB DB + 1GB storage) |
| Gemini API (400 images × 0.039 €) | ~16 € |
| Resend | 0 € (3000 emails/mois) |
| **Total** | **~16 €/mois** |

## Déploiement

### Vercel (recommandé)

```bash
npm i -g vercel
vercel
```

Ou via le dashboard Vercel : import du repo GitHub, ajouter les variables d'env, deploy.

### Variables d'env à ajouter sur Vercel

Toutes celles de `.env.example`, mais ⚠️ `NEXT_PUBLIC_APP_URL` doit pointer sur l'URL de prod (ex: `https://memories.ink`).

## Sécurité

- ✅ Clé service_role Supabase utilisée uniquement côté serveur
- ✅ Clé Gemini jamais exposée au client
- ✅ Photos clients dans bucket privé avec signed URLs (TTL 7j)
- ✅ Modération automatique des uploads avant génération
- ✅ Rate limiting via middleware (IP + session)
- ✅ Row Level Security activée sur toutes les tables

## License

© 2026 Memories Atelier. Tous droits réservés.
