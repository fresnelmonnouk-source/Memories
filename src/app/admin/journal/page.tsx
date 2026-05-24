import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createBlogPost, deleteBlogPost } from './actions'
import styles from './page.module.css'

export const metadata = { title: 'Journal — Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

function frDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function AdminJournalPage() {
  await requireAdmin()
  const admin = createAdminClient()
  const { data: posts } = await admin
    .from('blog_posts')
    .select('id, title, slug, is_published, published_at')
    .order('published_at', { ascending: false })

  return (
    <div className={styles.page}>
      <Link href="/admin" className={styles.backLink}>← Back office</Link>
      <span className={styles.crumb}><span className={styles.bar} />Journal · gestion</span>
      <h1 className={styles.title}>Écrire au <span className={styles.italic}>journal</span>.</h1>

      <form action={createBlogPost} className={styles.form}>
        <h2>Nouvel article</h2>
        <div>
          <label className={styles.label} htmlFor="title">Titre</label>
          <input id="title" name="title" className={styles.input} required maxLength={160} />
        </div>
        <div>
          <label className={styles.label} htmlFor="excerpt">Accroche (résumé court)</label>
          <input id="excerpt" name="excerpt" className={styles.input} maxLength={300} />
        </div>
        <div>
          <label className={styles.label} htmlFor="cover_url">Image de couverture (URL, optionnel)</label>
          <input id="cover_url" name="cover_url" className={styles.input} type="url" placeholder="https://…" />
        </div>
        <div>
          <label className={styles.label} htmlFor="body">Contenu</label>
          <textarea id="body" name="body" className={styles.textarea} required />
        </div>
        <button type="submit" className={styles.submit}>Publier l&apos;article</button>
      </form>

      <div className={styles.list}>
        {posts?.map((p) => (
          <div key={p.id} className={styles.row}>
            <div>
              <div className={styles.rowTitle}>{p.title}</div>
              <div className={styles.rowMeta}>
                {p.is_published ? 'publié' : 'brouillon'} · {frDate(p.published_at)} · /{p.slug}
              </div>
            </div>
            <form action={deleteBlogPost}>
              <input type="hidden" name="id" value={p.id} />
              <button type="submit" className={styles.del}>Supprimer</button>
            </form>
          </div>
        ))}
        {(!posts || posts.length === 0) && <p className={styles.empty}>Aucun article pour l&apos;instant.</p>}
      </div>
    </div>
  )
}
