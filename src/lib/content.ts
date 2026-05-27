import { createClient } from '@/lib/supabase/server'

export type BlockKind = 'text' | 'lines' | 'pipes'

export interface ContentBlock {
  key: string
  group: string
  label: string
  kind: BlockKind
  help: string
  default: string
}

/**
 * Registre des blocs de contenu éditables depuis l'admin (/admin/contenu).
 * Stockés dans `site_content` (clé → body). Valeur par défaut = contenu actuel
 * → aucun changement visuel tant qu'un bloc n'est pas édité.
 * Phase 1 = À propos. (Home + Footer ajoutés ensuite, même pattern.)
 */
export const CONTENT_BLOCKS: ContentBlock[] = [
  {
    key: 'apropos_vision',
    group: 'À propos',
    label: 'Vision (paragraphes)',
    kind: 'text',
    help: 'Texte libre. Laisse une ligne vide pour séparer les paragraphes.',
    default:
      "Memories est né d'une obsession : faire en sorte qu'un tatouage ne soit jamais un regret. On a commencé par poser des aiguilles avec rigueur. Puis on a construit un outil pour éviter les hésitations de dernière minute.\n\nNotre IA ne remplace pas l'artiste — elle l'accompagne. Tu visualises, tu doutes moins, tu décides mieux. L'atelier prend le relais quand tu es prêt.e.",
  },
  {
    key: 'apropos_soins',
    group: 'À propos',
    label: 'Soins post-tatouage',
    kind: 'lines',
    help: 'Une consigne par ligne. Format : « Titre · texte » (le titre avant le · est mis en gras).',
    default:
      "Jour 1-3 · Laisser le pansement 4h. Nettoyer à l'eau tiède, savon neutre. Sécher en tapotant.\nJour 4-14 · Crème cicatrisante 2-3× par jour. Ne pas gratter même si ça démange.\nMois 1-2 · Pas de soleil direct, pas de piscine, pas de bain prolongé.\nÀ vie · Hydratation, protection solaire SPF 50+ sur la zone tatouée.",
  },
  {
    key: 'apropos_tarifs',
    group: 'À propos',
    label: 'Tarifs (cartes)',
    kind: 'pipes',
    help: 'Une formule par ligne. Format : « Taille | description | prix ».',
    default:
      'XS | moins de 4 cm | à partir de 80 €\nS—M | 4 à 12 cm | 120 à 250 €\nL | 15 à 25 cm | 300 à 500 €\nXL | grandes pièces, sleeves, dos | sur devis',
  },
  {
    key: 'apropos_tarifs_note',
    group: 'À propos',
    label: 'Tarifs — note',
    kind: 'text',
    help: 'Petite note affichée sous les tarifs.',
    default: "Première consultation toujours gratuite. L'essayage IA aussi.",
  },
  {
    key: 'apropos_faq',
    group: 'À propos',
    label: 'FAQ',
    kind: 'pipes',
    help: 'Une question par ligne. Format : « Question | Réponse ».',
    default:
      "L'essayage IA est-il vraiment réaliste ? | Oui. Notre modèle respecte ta morphologie, la lumière de la photo et la texture de peau. Le rendu est à ~98% du résultat final.\nMes photos sont-elles stockées ? | Tes photos sont chiffrées et automatiquement supprimées 30 jours après ton essayage. Personne d'autre que toi ne peut y accéder.\nCombien de temps faut-il pour prendre rendez-vous ? | Selon l'artiste choisi : entre 2 et 8 semaines. Pour les grosses pièces, prévois 1 à 3 mois.\nAcceptez-vous les modifications de design ? | Oui. L'essayage IA est une base. L'artiste affine, adapte, sublime ta vision en consultation.\nFaites-vous des retouches ? | Une retouche gratuite est incluse dans les 2 mois suivant le tatouage si nécessaire.",
  },
]

export function blockByKey(key: string): ContentBlock | undefined {
  return CONTENT_BLOCKS.find((b) => b.key === key)
}

/** Lignes non vides. */
export function parseLines(body: string): string[] {
  return body.split('\n').map((l) => l.trim()).filter(Boolean)
}

/** Lignes → colonnes séparées par « | ». */
export function parsePipes(body: string): string[][] {
  return parseLines(body).map((l) => l.split('|').map((c) => c.trim()))
}

/**
 * Map clé→body pour une liste de clés : valeur éditée (site_content) sinon défaut.
 * Best-effort : si la table n'existe pas encore, on retombe sur les défauts.
 */
export async function getContentMap(keys: string[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {}
  for (const b of CONTENT_BLOCKS) if (keys.includes(b.key)) map[b.key] = b.default

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('site_content').select('key, body').in('key', keys)
    for (const row of data ?? []) if (row.body) map[row.key] = row.body
  } catch {
    /* table absente → défauts */
  }
  return map
}
