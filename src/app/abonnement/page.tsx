import Link from 'next/link'
import { requireUser, getProfile } from '@/lib/auth'
import { hasStripe } from '@/lib/stripe'
import { SubscribeButton, ManageButton } from './SubscribeButtons'
import styles from './page.module.css'

export const metadata = { title: 'Abonnement — Memories°', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AbonnementPage() {
  await requireUser()
  const profile = await getProfile()
  const subscribed = profile?.subscription_status === 'active'
  const available = hasStripe()

  return (
    <div className={styles.page}>
      <span className={styles.crumb}><span className={styles.bar} />Abonnement</span>
      <h1 className={styles.title}>Essaie <span className={styles.italic}>sans limite</span>.</h1>

      <div className={styles.card}>
        <div className={styles.price}>
          <span className={styles.amount}>4 €</span>
          <span className={styles.per}>/ mois</span>
        </div>
        <ul className={styles.list}>
          <li>Essayages IA <strong>illimités</strong></li>
          <li>Tes rendus gardés dans ton espace</li>
          <li>Sans engagement — résiliable à tout moment</li>
        </ul>

        {subscribed ? (
          <>
            <span className={styles.active}>✓ Abonnement actif</span>
            <ManageButton />
          </>
        ) : available ? (
          <SubscribeButton />
        ) : (
          <span className={styles.soon}>Abonnement bientôt disponible.</span>
        )}

        <p className={styles.note}>
          Tu gardes <strong>2 essais gratuits</strong> avec ton compte. L&apos;abonnement débloque l&apos;illimité.
        </p>
      </div>

      <Link href="/compte" className={styles.back}>← Mon espace</Link>
    </div>
  )
}
