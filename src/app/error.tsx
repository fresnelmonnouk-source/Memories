'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styles from './status.module.css'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log côté client uniquement ; la cause technique n'est jamais montrée à l'utilisateur.
    console.error(error)
  }, [error])

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <span className={styles.crumb}>
          <span className={styles.bar} />
          Erreur · système
        </span>

        <span className={styles.code}>!</span>

        <h1 className={styles.title}>
          Une <span className={styles.italic}>bavure</span> dans l&apos;encre.
        </h1>

        <p className={styles.text}>
          Quelque chose s&apos;est mal passé de notre côté. L&apos;incident est noté —
          réessaie dans un instant, ou reviens à l&apos;atelier.
        </p>

        {error.digest && <span className={styles.ref}>réf · {error.digest}</span>}

        <div className={styles.actions}>
          <button onClick={reset} className={styles.primary}>
            Réessayer <span>↻</span>
          </button>
          <Link href="/" className={styles.ghost}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
