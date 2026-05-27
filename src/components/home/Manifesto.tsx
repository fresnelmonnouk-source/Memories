import { getContentMap } from '@/lib/content'
import styles from './Manifesto.module.css'

export async function Manifesto() {
  const map = await getContentMap(['home_manifeste'])
  return (
    <section className={styles.manifesto}>
      <div className={styles.label} data-reveal>
        <span className={styles.bar} />
        Manifeste · 001
      </div>

      <div className={styles.grid}>
        <h2 className={styles.quote} data-reveal>
          L&apos;encre ne se reprend pas.
          <sub>01</sub>{' '}
          <span className={styles.italic}>Le pixel,</span> si.
        </h2>

        <div className={styles.body} data-reveal>
          {map.home_manifeste.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
        </div>
      </div>
    </section>
  )
}
