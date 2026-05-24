import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/utils'

// Sitemap des pages publiques. Les pages privées (/essayage/[token]) et les
// routes /api sont volontairement exclues. Les pages détail [slug] viendront
// en Phase 2 (on les ajoutera ici en lisant les slugs Supabase).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const now = new Date()

  const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
    { path: '',              changeFrequency: 'weekly',  priority: 1.0 },
    { path: '/essayage',     changeFrequency: 'monthly', priority: 0.9 },
    { path: '/catalogue',    changeFrequency: 'weekly',  priority: 0.8 },
    { path: '/realisations', changeFrequency: 'weekly',  priority: 0.7 },
    { path: '/journal',      changeFrequency: 'weekly',  priority: 0.7 },
    { path: '/communaute',   changeFrequency: 'daily',   priority: 0.6 },
    { path: '/a-propos',     changeFrequency: 'monthly', priority: 0.6 },
    { path: '/reservation',  changeFrequency: 'monthly', priority: 0.6 },
  ]

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
