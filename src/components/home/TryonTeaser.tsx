import Link from 'next/link'
import styles from './TryonTeaser.module.css'

export function TryonTeaser() {
  return (
    <section className={styles.teaser}>
      <div className={styles.label} data-reveal>
        <span className={styles.bar} />
        Laboratoire IA · 002
      </div>

      <div className={styles.grid}>
        <h2 className={styles.title} data-reveal>
          <span className={styles.italic}>Essaie</span><br />
          ton encre.<br />
          <span className={styles.stroke}>Maintenant.</span>
        </h2>

        <div className={styles.right}>
          <ol className={styles.steps} data-reveal>
            <li>
              <span className={styles.num}>01</span>
              <span className={styles.stepTitle}>Photographie</span>
              <span className={styles.stepDesc}>
                Deux photos : plan large pour la silhouette, gros plan pour la zone.
              </span>
            </li>
            <li>
              <span className={styles.num}>02</span>
              <span className={styles.stepTitle}>Choisis</span>
              <span className={styles.stepDesc}>
                Notre catalogue de 124 motifs, ou ton propre dessin uploadé.
              </span>
            </li>
            <li>
              <span className={styles.num}>03</span>
              <span className={styles.stepTitle}>Révélation</span>
              <span className={styles.stepDesc}>
                15 secondes. Deux rendus. Une décision plus simple.
              </span>
            </li>
          </ol>

          <Link href="/essayage" className={styles.cta} data-reveal>
            <span className={styles.arr}>→</span>
            Lancer le laboratoire
          </Link>
        </div>
      </div>
    </section>
  )
}
