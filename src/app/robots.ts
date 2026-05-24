import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/utils'

// On NE disallow PAS /essayage/ : la page résultat individuelle est déjà en
// `noindex` via ses metadata, et il faut laisser le crawler la lire pour voir
// ce noindex. On bloque seulement les routes techniques /api.
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
