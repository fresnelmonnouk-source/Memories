import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import styles from './page.module.css'

export const metadata = {
  title: 'Journal — Memories°',
  description: 'Le journal de l\'atelier Memories : encre, soins, culture du tatouage.',
}

export const dynamic = 'force-dynamic'

function frDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, cover_url, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(50)

  return (
    <div className={styles.page}>
      <span className={styles.crumb}><span className={styles.bar} />Journal de l&apos;atelier</span>
      <h1 className={styles.title}>Le <span className={styles.italic}>journal</span>.</h1>
      <p className={styles.intro}>
        Encre, soins, culture du tatouage et coulisses de l&apos;atelier.
      </p>

      <div className={styles.grid}>
        {posts?.map((p) => (
          <Link key={p.id} href={`/journal/${p.slug}`} className={styles.card}>
            <div className={styles.cover}>
              {p.cover_url
                ? <Image src={p.cover_url} alt={p.title} fill sizes="(max-width: 880px) 100vw, 300px" />
                : <div className={styles.coverEmpty}>{p.title.charAt(0)}</div>}
            </div>
            <div className={styles.cardBody}>
              <span className={styles.date}>{frDate(p.published_at)}</span>
              <h2 className={styles.cardTitle}>{p.title}</h2>
              {p.excerpt && <p className={styles.excerpt}>{p.excerpt}</p>}
            </div>
          </Link>
        ))}

        {(!posts || posts.length === 0) && (
          <p className={styles.empty}>Le journal s&apos;écrit bientôt.</p>
        )}
      </div>
    </div>
  )
}
