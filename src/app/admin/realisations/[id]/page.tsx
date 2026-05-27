import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { RealisationForm } from '@/components/admin/RealisationForm'
import { updateRealisation } from '../actions'
import styles from '../../catalogue/page.module.css'

export const metadata = { title: 'Éditer une réalisation — Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function EditRealisationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const admin = createAdminClient()
  const [{ data: work }, { data: artists }] = await Promise.all([
    admin.from('realisations').select('*').eq('id', id).maybeSingle(),
    admin.from('artists').select('id, name').order('display_order'),
  ])
  if (!work) notFound()

  return (
    <div className={styles.page}>
      <Link href="/admin/realisations" className={styles.backLink}>← Réalisations</Link>
      <span className={styles.crumb}><span className={styles.bar} />Éditer</span>
      <h1 className={styles.title}>{work.title}</h1>
      <RealisationForm action={updateRealisation} realisation={work} artists={artists ?? []} submitLabel="Enregistrer les modifications" />
    </div>
  )
}
