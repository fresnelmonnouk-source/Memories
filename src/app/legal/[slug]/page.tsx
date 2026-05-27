import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LEGAL_SLUGS, LEGAL_KEY, LEGAL_DEFAULTS, type LegalSlug } from '@/lib/legal'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

function isLegalSlug(s: string): s is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(s)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isLegalSlug(slug)) return { title: 'Mentions — Memories°' }
  return { title: `${LEGAL_DEFAULTS[slug].title} — Memories°` }
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isLegalSlug(slug)) notFound()

  const def = LEGAL_DEFAULTS[slug]
  const supabase = await createClient()
  const { data: content } = await supabase
    .from('site_content')
    .select('title, body, updated_at')
    .eq('key', LEGAL_KEY[slug])
    .maybeSingle()

  const title = content?.title || def.title
  const body = content?.body || def.body

  return (
    <div className={styles.page}>
      <span className={styles.crumb}><span className={styles.bar} />Légal</span>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.body}>{body}</div>
      {content?.updated_at && (
        <p className={styles.updated}>
          Dernière mise à jour : {new Date(content.updated_at).toLocaleDateString('fr-FR')}
        </p>
      )}
      <nav className={styles.nav}>
        <Link href="/legal/mentions-legales">Mentions légales</Link>
        <Link href="/legal/confidentialite">Confidentialité</Link>
        <Link href="/legal/cgv">CGV</Link>
      </nav>
    </div>
  )
}
