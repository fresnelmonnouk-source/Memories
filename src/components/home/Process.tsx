import { getContentMap, parsePipes } from '@/lib/content'
import styles from './Process.module.css'

export async function Process() {
  const map = await getContentMap(['home_process_steps'])
  const steps = parsePipes(map.home_process_steps)
  return (
    <section className={styles.process}>
      <div className={styles.label} data-reveal>
        <span className={styles.bar} />
        Protocole · 003
      </div>
      <h2 className={styles.title} data-reveal>
        <span className={styles.stroke}>Comment</span>
        <br />
        <span className={styles.italic}>ça marche.</span>
      </h2>

      <div className={styles.list}>
        {steps.map((s, i) => (
          <div key={i} className={styles.row} data-reveal>
            <span className={styles.num}>/ {String(i + 1).padStart(2, '0')}</span>
            <span className={styles.name}>{s[0]}</span>
            <span className={styles.desc}>{s[1]}</span>
            <span className={styles.time}>{s[2]}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
