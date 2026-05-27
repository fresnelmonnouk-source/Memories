import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { CONTENT_BLOCKS } from '@/lib/content'
import { saveContent } from './actions'
import styles from '../journal/page.module.css'

export const metadata = { title: 'Contenu du site — Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminContenuPage() {
  await requireAdmin()
  const admin = createAdminClient()
  const { data: rows } = await admin
    .from('site_content')
    .select('key, body')
    .in('key', CONTENT_BLOCKS.map((b) => b.key))
  const byKey = new Map((rows ?? []).map((r) => [r.key, r.body]))

  const groups = [...new Set(CONTENT_BLOCKS.map((b) => b.group))]

  return (
    <div className={styles.page}>
      <Link href="/admin" className={styles.backLink}>← Back office</Link>
      <span className={styles.crumb}><span className={styles.bar} />Contenu du site</span>
      <h1 className={styles.title}>Textes <span className={styles.italic}>éditoriaux</span>.</h1>

      {groups.map((group) => (
        <section key={group} style={{ marginBottom: 12 }}>
          <p className={styles.rowMeta} style={{ margin: '28px 0 6px', color: 'var(--blood)' }}>{group}</p>
          {CONTENT_BLOCKS.filter((b) => b.group === group).map((b) => (
            <form key={b.key} action={saveContent} className={styles.form} style={{ marginBottom: 20 }}>
              <h2>{b.label}</h2>
              <input type="hidden" name="key" value={b.key} />
              <p className={styles.rowMeta}>{b.help}</p>
              <textarea
                name="body"
                className={styles.textarea}
                rows={b.kind === 'text' ? 6 : 8}
                required
                defaultValue={byKey.get(b.key) ?? b.default}
              />
              <button type="submit" className={styles.submit}>Enregistrer</button>
            </form>
          ))}
        </section>
      ))}
    </div>
  )
}
