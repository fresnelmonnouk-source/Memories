import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { TATTOO_STYLE_LABELS } from '@/lib/utils'
import type { TattooStyle } from '@/types/database'
import { RealisationForm } from '@/components/admin/RealisationForm'
import { createRealisation, deleteRealisation, setRealisationFlag } from './actions'
import styles from '../catalogue/page.module.css'

export const metadata = { title: 'Réalisations — Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminRealisationsPage() {
  await requireAdmin()
  const admin = createAdminClient()
  const [{ data: works }, { data: artists }] = await Promise.all([
    admin.from('realisations').select('*').order('display_order'),
    admin.from('artists').select('id, name').order('display_order'),
  ])

  return (
    <div className={styles.page}>
      <Link href="/admin" className={styles.backLink}>← Back office</Link>
      <span className={styles.crumb}><span className={styles.bar} />Réalisations</span>
      <h1 className={styles.title}>Gérer les <span className={styles.italic}>réalisations</span>.</h1>

      <RealisationForm action={createRealisation} artists={artists ?? []} submitLabel="Ajouter la réalisation" />

      <h2 className={styles.sectionTitle}>{works?.length ?? 0} réalisations</h2>
      <div className={styles.list}>
        {works?.map((w) => (
          <div key={w.id} className={styles.row}>
            <img className={styles.thumb} src={w.thumbnail_url ?? w.image_url} alt={w.title} />
            <div className={styles.info}>
              <span className={styles.name}>{w.title}</span>
              <span className={styles.meta}>{w.style ? TATTOO_STYLE_LABELS[w.style as TattooStyle] : '—'}</span>
              <div className={styles.flags}>
                <span className={`${styles.flag} ${w.is_active ? styles.flagOn : ''}`}>{w.is_active ? 'actif' : 'inactif'}</span>
                {w.is_featured && <span className={`${styles.flag} ${styles.flagOn}`}>en avant</span>}
              </div>
            </div>
            <div className={styles.actions}>
              <Link href={`/admin/realisations/${w.id}`} className={styles.btn}>Éditer</Link>
              <form action={setRealisationFlag}>
                <input type="hidden" name="id" value={w.id} />
                <input type="hidden" name="field" value="is_active" />
                <input type="hidden" name="value" value={(!w.is_active).toString()} />
                <button type="submit" className={styles.btn}>{w.is_active ? 'Désactiver' : 'Activer'}</button>
              </form>
              <form action={deleteRealisation}>
                <input type="hidden" name="id" value={w.id} />
                <button type="submit" className={styles.btn}>Supprimer</button>
              </form>
            </div>
          </div>
        ))}
        {(!works || works.length === 0) && <p className={styles.empty}>Aucune réalisation.</p>}
      </div>
    </div>
  )
}
