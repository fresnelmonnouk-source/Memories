import Link from 'next/link'
import { requireUser, getProfile } from '@/lib/auth'
import styles from './page.module.css'

export const metadata = {
  title: 'Mon espace — Memories°',
  robots: { index: false },
}

const FREE_ACCOUNT_TRYOUTS = 2

export default async function ComptePage() {
  await requireUser()
  const profile = await getProfile()

  const isAdmin = profile?.role === 'admin'
  const subscribed = profile?.subscription_status === 'active'
  const used = profile?.account_tryouts_used ?? 0
  const remaining = subscribed ? '∞' : Math.max(0, FREE_ACCOUNT_TRYOUTS - used)
  const name = profile?.display_name || 'toi'

  return (
    <div className={styles.page}>
      <span className={styles.crumb}><span className={styles.bar} />Mon espace</span>
      <h1 className={styles.title}>
        Salut, <span className={styles.italic}>{name}</span>.
      </h1>
      <p className={styles.sub}>{profile?.email}</p>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.label}>Essais restants</span>
          <span className={styles.value}>
            <span className={styles.accent}>{remaining}</span>{' '}
            <small>{subscribed ? 'abonnement actif' : `sur ${FREE_ACCOUNT_TRYOUTS} gratuits`}</small>
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.label}>Abonnement</span>
          <span className={styles.value}>{subscribed ? 'Actif' : 'Gratuit'}</span>
        </div>
        {isAdmin && (
          <div className={styles.card}>
            <span className={styles.label}>Rôle</span>
            <span className={styles.badge}>Administrateur</span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Link href="/essayage" className={styles.btnPrimary}>Lancer un essayage <span>→</span></Link>
        {isAdmin && <Link href="/admin" className={styles.btnGhost}>Back office</Link>}
        <form action="/auth/signout" method="post">
          <button type="submit" className={styles.signout}>Se déconnecter</button>
        </form>
      </div>
    </div>
  )
}
