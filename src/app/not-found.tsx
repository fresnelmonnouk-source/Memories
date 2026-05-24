import Link from 'next/link'
import styles from './status.module.css'

export const metadata = {
  title: '404 — Memories°',
  description: "Cette page n'existe pas.",
}

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <span className={styles.crumb}>
          <span className={styles.bar} />
          Erreur · 404 · page introuvable
        </span>

        <span className={styles.code}>404</span>

        <h1 className={styles.title}>
          Ce motif n&apos;est <span className={styles.italic}>pas</span> dans nos carnets.
        </h1>

        <p className={styles.text}>
          La page que tu cherches n&apos;existe pas, ou n&apos;a jamais été encrée.
          L&apos;encre ne se reprend pas — mais on peut te ramener à l&apos;atelier.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            Retour à l&apos;accueil <span>→</span>
          </Link>
          <Link href="/catalogue" className={styles.ghost}>
            Voir le catalogue
          </Link>
        </div>
      </div>
    </div>
  )
}
