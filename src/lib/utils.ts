import type { BodyZone, TattooStyle } from '@/types/database'

export const BODY_ZONE_LABELS: Record<BodyZone, string> = {
  forearm:  'Avant-bras',
  full_arm: 'Bras complet',
  shoulder: 'Épaule',
  back:     'Dos',
  chest:    'Poitrine',
  thigh:    'Cuisse',
  calf:     'Mollet',
  ankle:    'Cheville',
  ribs:     'Côtes',
  neck:     'Cou',
  hand:     'Main',
  other:    'Autre',
}

export const TATTOO_STYLE_LABELS: Record<TattooStyle, string> = {
  fine_line:       'Fine line',
  blackwork:       'Blackwork',
  neo_traditional: 'Néo-traditionnel',
  japanese:        'Japonais',
  realism:         'Réalisme',
  geometric:       'Géométrique',
  minimalist:      'Minimaliste',
  tribal:          'Tribal',
  other:           'Autre',
}

/** Convertit un File en base64 pour upload */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      // Retire le préfixe "data:image/png;base64,"
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Slug FR-friendly */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Format de prix EUR */
export function formatPrice(eur: number | null | undefined): string {
  if (eur == null) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(eur)
}

/** Récupère l'IP client depuis les headers de Next.js */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    headers.get('x-real-ip') ??
    '0.0.0.0'
  )
}

/**
 * Compteur rate-limit « du jour » (UTC). Retourne 0 si le dernier accès
 * stocké date d'un jour antérieur — cohérent avec le reset quotidien de
 * `bump_rate_limit`. Évite qu'un compteur cumulé bloque l'IP à vie.
 */
export function countToday(
  lastSeenAt: string | null | undefined,
  count: number | null | undefined,
): number {
  if (!lastSeenAt) return 0
  const today = new Date().toISOString().slice(0, 10)
  const seen = new Date(lastSeenAt).toISOString().slice(0, 10)
  return seen === today ? (count ?? 0) : 0
}
