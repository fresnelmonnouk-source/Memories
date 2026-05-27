import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { LEGAL_SLUGS, LEGAL_KEY, LEGAL_DEFAULTS } from '@/lib/legal'
import { saveLegal } from './actions'
import styles from '../journal/page.module.css'

export const metadata = { title: 'Contenu légal — Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminLegalPage() {
  await requireAdmin()
  const admin = createAdminClient()
  const { data: rows } = await admin.from('site_content').select('key, title, body')
  const byKey = new Map((rows ?? []).map((r) => [r.key, r]))

  return (
    <div className={styles.page}>
      <Link href="/admin" className={styles.backLink}>← Back office</Link>
      <span className={styles.crumb}><span className={styles.bar} />Contenu légal</span>
      <h1 className={styles.title}>Pages <span className={styles.italic}>légales</span>.</h1>

      {LEGAL_SLUGS.map((slug) => {
        const key = LEGAL_KEY[slug]
        const def = LEGAL_DEFAULTS[slug]
        const current = byKey.get(key)
        return (
          <form key={key} action={saveLegal} className={styles.form} style={{ marginBottom: 28 }}>
            <h2>{def.title} <span style={{ fontStyle: 'normal', fontSize: 12, opacity: 0.6 }}>· /legal/{slug}</span></h2>
            <input type="hidden" name="key" value={key} />
            <div>
              <label className={styles.label} htmlFor={`title-${key}`}>Titre</label>
              <input id={`title-${key}`} name="title" className={styles.input} required defaultValue={current?.title ?? def.title} />
            </div>
            <div>
              <label className={styles.label} htmlFor={`body-${key}`}>Contenu</label>
              <textarea id={`body-${key}`} name="body" className={styles.textarea} required rows={14} defaultValue={current?.body ?? def.body} />
            </div>
            <button type="submit" className={styles.submit}>Enregistrer</button>
          </form>
        )
      })}
    </div>
  )
}
