import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { TATTOO_STYLE_LABELS } from '@/lib/utils'
import type { TattooStyle } from '@/types/database'
import { ArtistForm } from '@/components/admin/ArtistForm'
import { createArtist, deleteArtist, setArtistActive } from './actions'
import styles from '../catalogue/page.module.css'

export const metadata = { title: 'Artistes — Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

export default async function AdminArtistesPage() {
  await requireAdmin()
  const admin = createAdminClient()
  const { data: artists } = await admin.from('artists').select('*').order('display_order')

  return (
    <div className={styles.page}>
      <Link href="/admin" className={styles.backLink}>← Back office</Link>
      <span className={styles.crumb}><span className={styles.bar} />Artistes</span>
      <h1 className={styles.title}>Gérer les <span className={styles.italic}>artistes</span>.</h1>

      <ArtistForm action={createArtist} submitLabel="Ajouter l'artiste" />

      <h2 className={styles.sectionTitle}>{artists?.length ?? 0} artistes</h2>
      <div className={styles.list}>
        {artists?.map((a) => (
          <div key={a.id} className={styles.row}>
            {a.portrait_url
              ? <img className={styles.thumb} src={a.portrait_url} alt={a.name} />
              : <div className={styles.thumb} style={{ display: 'grid', placeItems: 'center', fontStyle: 'italic' }}>{initials(a.name)}</div>}
            <div className={styles.info}>
              <span className={styles.name}>{a.name}</span>
              <span className={styles.meta}>
                {a.primary_style ? TATTOO_STYLE_LABELS[a.primary_style as TattooStyle] : '—'} · {a.years_experience} ans
              </span>
              <div className={styles.flags}>
                <span className={`${styles.flag} ${a.is_active ? styles.flagOn : ''}`}>{a.is_active ? 'actif' : 'inactif'}</span>
              </div>
            </div>
            <div className={styles.actions}>
              <Link href={`/admin/artistes/${a.id}`} className={styles.btn}>Éditer</Link>
              <form action={setArtistActive}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="value" value={(!a.is_active).toString()} />
                <button type="submit" className={styles.btn}>{a.is_active ? 'Désactiver' : 'Activer'}</button>
              </form>
              <form action={deleteArtist}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className={styles.btn}>Supprimer</button>
              </form>
            </div>
          </div>
        ))}
        {(!artists || artists.length === 0) && <p className={styles.empty}>Aucun artiste.</p>}
      </div>
    </div>
  )
}
