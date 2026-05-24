import Link from 'next/link'
import { HeroDemo } from './HeroDemo'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`${styles.crosshair} ${styles.tl}`} />
      <div className={`${styles.crosshair} ${styles.tr}`} />

      <div className={styles.meta}>
        <span>MEMORIES · ATELIER №14 · 2026</span>
        <span className={styles.live}>Studio en activité</span>
        <span>Essais générés <strong>·</strong> 12 847</span>
      </div>

      <div className={styles.stage}>
        <h1 className={styles.title}>
          <span className={styles.line}>Essaie</span>
          <span className={styles.line}><span className={styles.italic}>avant</span></span>
          <span className={styles.line}>d&apos;oser<span style={{ color: 'var(--blood)' }}>.</span></span>
        </h1>

        <HeroDemo />
      </div>

      <div className={styles.bottom}>
        <div className={styles.desc}>
          Un tatouage est une décision <strong>permanente</strong>. Notre IA te
          laisse le porter sur ta peau, en photo, avant même de pousser la porte
          de l&apos;atelier. Photographie · Sélectionne · Visualise. L&apos;encre attendra.
        </div>
        <Link href="/essayage" className={styles.cta}>
          <span className={styles.arrow}>→</span>
          Lancer l&apos;essayage
        </Link>
        <div className={styles.stats}>
          <span className={styles.num}>98<span style={{ fontSize: 30 }}>%</span></span>
          <span className={styles.label}>de fidélité<br />au rendu final</span>
        </div>
      </div>
    </section>
  )
}
