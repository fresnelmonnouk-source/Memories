import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { BODY_ZONE_LABELS } from '@/lib/utils'
import type { BodyZone, BookingStatus } from '@/types/database'
import { updateBookingStatus } from './actions'
import styles from './page.module.css'

export const metadata = { title: 'Réservations — Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

const STATUS_FR: Record<BookingStatus, string> = {
  new: 'Nouvelle', contacted: 'Contacté', confirmed: 'Confirmé', completed: 'Terminé', cancelled: 'Annulé',
}
const STATUSES = Object.keys(STATUS_FR) as BookingStatus[]

function frDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function AdminReservationsPage() {
  await requireAdmin()
  const admin = createAdminClient()
  const { data: bookings } = await admin
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className={styles.page}>
      <Link href="/admin" className={styles.backLink}>← Back office</Link>
      <span className={styles.crumb}><span className={styles.bar} />Réservations</span>
      <h1 className={styles.title}>Demandes de <span className={styles.italic}>séance</span>.</h1>

      <div className={styles.list}>
        {bookings?.map((b) => (
          <div key={b.id} className={styles.card}>
            <div className={styles.head}>
              <span className={styles.name}>{b.first_name} {b.last_name}</span>
              <span className={styles.date}>{frDate(b.created_at)}</span>
            </div>
            <div className={styles.meta}>
              <a href={`mailto:${b.email}`}>{b.email}</a>
              {b.phone ? ` · ${b.phone}` : ''}
              {b.body_zone ? ` · ${BODY_ZONE_LABELS[b.body_zone as BodyZone]}` : ''}
            </div>
            {b.project_description && <p className={styles.project}>{b.project_description}</p>}
            <div className={styles.statusRow}>
              <span className={styles.badge} data-s={b.status}>{STATUS_FR[b.status]}</span>
              <form action={updateBookingStatus} style={{ display: 'flex', gap: 8 }}>
                <input type="hidden" name="id" value={b.id} />
                <select name="status" defaultValue={b.status} className={styles.select} aria-label="Statut">
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_FR[s]}</option>)}
                </select>
                <button type="submit" className={styles.upd}>Mettre à jour</button>
              </form>
            </div>
          </div>
        ))}
        {(!bookings || bookings.length === 0) && (
          <p className={styles.empty}>Aucune réservation pour l&apos;instant.</p>
        )}
      </div>
    </div>
  )
}
