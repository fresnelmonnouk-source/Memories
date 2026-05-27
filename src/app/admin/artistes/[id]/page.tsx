import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { ArtistForm } from '@/components/admin/ArtistForm'
import { updateArtist } from '../actions'
import styles from '../../catalogue/page.module.css'

export const metadata = { title: 'Éditer un artiste — Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const admin = createAdminClient()
  const { data: artist } = await admin.from('artists').select('*').eq('id', id).maybeSingle()
  if (!artist) notFound()

  return (
    <div className={styles.page}>
      <Link href="/admin/artistes" className={styles.backLink}>← Artistes</Link>
      <span className={styles.crumb}><span className={styles.bar} />Éditer</span>
      <h1 className={styles.title}>{artist.name}</h1>
      <ArtistForm action={updateArtist} artist={artist} submitLabel="Enregistrer les modifications" />
    </div>
  )
}
