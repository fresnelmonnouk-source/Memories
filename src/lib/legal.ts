// Slugs des pages légales (URL /legal/<slug>) → clé site_content `legal_<slug...>`.
export const LEGAL_SLUGS = ['mentions-legales', 'confidentialite', 'cgv'] as const
export type LegalSlug = (typeof LEGAL_SLUGS)[number]

export const LEGAL_KEY: Record<LegalSlug, string> = {
  'mentions-legales': 'legal_mentions',
  confidentialite: 'legal_confidentialite',
  cgv: 'legal_cgv',
}

interface LegalDoc {
  slug: LegalSlug
  title: string
  body: string
}

/**
 * Textes par défaut (MODÈLES à faire relire par un professionnel du droit).
 * Affichés tant que l'admin n'a pas édité le bloc correspondant.
 * Les `[À COMPLÉTER]` doivent être remplis par le studio.
 */
export const LEGAL_DEFAULTS: Record<LegalSlug, LegalDoc> = {
  'mentions-legales': {
    slug: 'mentions-legales',
    title: 'Mentions légales',
    body: `ÉDITEUR DU SITE
Memories Atelier — studio de tatouage.
14, rue des Bains, Quartier Adidogomé, Lomé — Togo.
RCCM : TG-LOM 2026 B [À COMPLÉTER]
Directeur de la publication : [À COMPLÉTER]
Contact : [email de l'atelier] · [téléphone]

HÉBERGEMENT
Site hébergé par Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, USA — vercel.com
Base de données et stockage : Supabase.

PROPRIÉTÉ INTELLECTUELLE
L'ensemble des contenus du site (textes, visuels, motifs de tatouage, identité visuelle) est la propriété de Memories Atelier, sauf mention contraire. Toute reproduction sans autorisation est interdite.

ÂGE LÉGAL
Le tatouage est interdit aux mineurs. Une autorisation parentale écrite est obligatoire pour les 16-18 ans, sur présentation d'une pièce d'identité.`,
  },
  confidentialite: {
    slug: 'confidentialite',
    title: 'Politique de confidentialité',
    body: `Memories Atelier accorde une grande importance à la protection de tes données personnelles.

DONNÉES COLLECTÉES
- Essayage IA : les photos que tu téléverses (corps + zone) et les rendus générés.
- Réservation : prénom, nom, email, téléphone, description de projet.
- Compte : email, pseudo, et l'historique de tes essayages.

FINALITÉS
Les photos servent uniquement à générer ton aperçu de tatouage. Les données de réservation servent à te recontacter et préparer ta séance.

CONSERVATION
- Photos téléversées : supprimées automatiquement après 30 jours.
- Rendus générés : conservés 7 jours puis supprimés.
- Données de réservation/compte : conservées le temps de la relation, puis archivées/supprimées selon la durée légale.

PARTAGE / SOUS-TRAITANTS
Tes données ne sont jamais vendues. Des prestataires techniques les traitent pour notre compte : Supabase (base & stockage), Google Gemini et OpenAI (génération d'images), Resend (emails). L'envoi de tes photos à l'atelier lors d'une réservation se fait uniquement avec ton consentement explicite.

TES DROITS (RGPD)
Tu disposes d'un droit d'accès, de rectification, de suppression et d'opposition. Pour l'exercer : [email de contact].

COOKIES
Le site utilise des cookies strictement nécessaires (session de connexion). Voir le bandeau cookies.`,
  },
  cgv: {
    slug: 'cgv',
    title: 'Conditions générales',
    body: `Les présentes conditions encadrent l'usage du site et des services de Memories Atelier.

ESSAYAGE IA
L'essayage virtuel est un aperçu indicatif généré par intelligence artificielle. Le rendu réel d'un tatouage peut différer. Offre : 1 essai gratuit sans compte, 2 essais gratuits après création de compte, puis abonnement [4 €/mois] pour un usage illimité.

TARIFS
Les prix affichés sont INDICATIFS. Le prix définitif d'un tatouage est fixé en consultation, selon la taille, la complexité et la zone. La première consultation est gratuite.

RÉSERVATION & CONSULTATION
Une demande de réservation ne vaut pas confirmation de séance : l'atelier recontacte le client pour convenir d'un rendez-vous. Un acompte pourra être demandé pour bloquer une date [À COMPLÉTER].

ANNULATION
[Politique d'annulation / acompte — À COMPLÉTER]

SANTÉ & RESPONSABILITÉ
Le client s'engage à signaler toute condition médicale (allergie, grossesse, traitement). Le respect des consignes de soin post-tatouage relève de la responsabilité du client. Une retouche gratuite est offerte dans les 2 mois si nécessaire.

ÂGE
Aucun tatouage sur mineur. Autorisation parentale obligatoire pour les 16-18 ans.`,
  },
}
