import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { TATTOO_STYLE_LABELS, formatPrice } from '@/lib/utils'
import type { TattooStyle } from '@/types/database'
import { TattooForm } from '@/components/admin/TattooForm'
import { createTattoo, deleteTattoo, setTattooFlag } from './actions'
import styles from './page.module.css'

export const metadata = { title: 'Catalogue — Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminCataloguePage() {
  await requireAdmin()
  const admin = createAdminClient()
  const { data: tattoos } = await admin
    .from('tattoos')
    .select('*')
    .order('display_order')

  return (
    <div className={styles.page}>
      <Link href="/admin" className={styles.backLink}>← Back office</Link>
      <span className={styles.crumb}><span className={styles.bar} />Catalogue</span>
      <h1 className={styles.title}>Gérer le <span className={styles.italic}>catalogue</span>.</h1>

      <TattooForm action={createTattoo} submitLabel="Ajouter le motif" />

      <h2 className={styles.sectionTitle}>{tattoos?.length ?? 0} motifs</h2>
      <div className={styles.list}>
        {tattoos?.map((t) => (
          <div key={t.id} className={styles.row}>
            <img className={styles.thumb} src={t.thumbnail_url ?? t.image_url} alt={t.name} />
            <div className={styles.info}>
              <span className={styles.name}>{t.name}</span>
              <span className={styles.meta}>
                {t.style ? TATTOO_STYLE_LABELS[t.style as TattooStyle] : '—'} · {t.size_label ?? '—'} · {formatPrice(t.base_price_eur)}
              </span>
              <div className={styles.flags}>
                <span className={`${styles.flag} ${t.is_active ? styles.flagOn : ''}`}>{t.is_active ? 'actif' : 'inactif'}</span>
                {t.is_featured && <span className={`${styles.flag} ${styles.flagOn}`}>en avant</span>}
              </div>
            </div>
            <div className={styles.actions}>
              <Link href={`/admin/catalogue/${t.id}`} className={styles.btn}>Éditer</Link>
              <form action={setTattooFlag}>
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="field" value="is_active" />
                <input type="hidden" name="value" value={(!t.is_active).toString()} />
                <button type="submit" className={styles.btn}>{t.is_active ? 'Désactiver' : 'Activer'}</button>
              </form>
              <form action={setTattooFlag}>
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="field" value="is_featured" />
                <input type="hidden" name="value" value={(!t.is_featured).toString()} />
                <button type="submit" className={styles.btn}>{t.is_featured ? 'Retirer avant' : 'Mettre avant'}</button>
              </form>
              <form action={deleteTattoo}>
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className={styles.btn}>Supprimer</button>
              </form>
            </div>
          </div>
        ))}
        {(!tattoos || tattoos.length === 0) && <p className={styles.empty}>Aucun motif.</p>}
      </div>
    </div>
  )
}
