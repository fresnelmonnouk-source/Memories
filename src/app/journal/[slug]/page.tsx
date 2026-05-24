import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import styles from '../page.module.css'

export const dynamic = 'force-dynamic'

function frDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
  if (!post) return { title: 'Article — Memories°' }
  return { title: `${post.title} — Memories°`, description: post.excerpt ?? undefined }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!post) notFound()

  return (
    <div className={styles.page}>
      <article className={styles.article}>
        <span className={styles.crumb}><span className={styles.bar} />Journal</span>
        {post.cover_url && (
          <div className={styles.articleCover}><img src={post.cover_url} alt={post.title} /></div>
        )}
        <span className={styles.date}>{frDate(post.published_at)}</span>
        <h1 className={styles.articleTitle}>{post.title}</h1>
        <div className={styles.articleBody}>{post.body}</div>
        <Link href="/journal" className={styles.back}>← Tous les articles</Link>
      </article>
    </div>
  )
}
