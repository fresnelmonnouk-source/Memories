import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { TattooForm } from '@/components/admin/TattooForm'
import { updateTattoo } from '../actions'
import styles from '../page.module.css'

export const metadata = { title: 'Éditer un motif — Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function EditTattooPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const admin = createAdminClient()
  const { data: tattoo } = await admin.from('tattoos').select('*').eq('id', id).maybeSingle()
  if (!tattoo) notFound()

  return (
    <div className={styles.page}>
      <Link href="/admin/catalogue" className={styles.backLink}>← Catalogue</Link>
      <span className={styles.crumb}><span className={styles.bar} />Éditer</span>
      <h1 className={styles.title}>{tattoo.name}</h1>
      <TattooForm action={updateTattoo} tattoo={tattoo} submitLabel="Enregistrer les modifications" />
    </div>
  )
}
