import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import styles from '../compte/page.module.css'

export const metadata = {
  title: 'Back office — Memories°',
  robots: { index: false },
}

// Modules du back office — câblés au fil des sprints suivants.
const MODULES = [
  'Catalogue',
  'Artistes',
  'Réalisations',
  'Réservations',
  'Mini-blog',
  'Communauté',
  'Contenu légal',
]

export default async function AdminPage() {
  const profile = await requireAdmin()

  return (
    <div className={styles.page}>
      <span className={styles.crumb}><span className={styles.bar} />Back office</span>
      <h1 className={styles.title}>
        Console <span className={styles.italic}>Memories</span>.
      </h1>
      <p className={styles.sub}>Connecté en tant qu&apos;administrateur · {profile.email}</p>

      <div className={styles.modules}>
        {MODULES.map((m) => (
          <div key={m} className={styles.module}>
            <span className={styles.moduleName}>{m}</span>
            <span className={styles.soon}>à venir</span>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <Link href="/compte" className={styles.btnGhost}>Mon espace</Link>
        <form action="/auth/signout" method="post">
          <button type="submit" className={styles.signout}>Se déconnecter</button>
        </form>
      </div>
    </div>
  )
}
