import { getContentMap, parseLines } from '@/lib/content'
import styles from './Marquee.module.css'

export async function Marquee() {
  const map = await getContentMap(['marquee_items'])
  const items = parseLines(map.marquee_items)
  // Dupliqué pour boucle fluide
  const all = [...items, ...items, ...items, ...items]

  return (
    <div className={styles.marquee}>
      <div className={styles.track}>
        {all.map((item, i) => (
          <span key={i} className={styles.item}>
            <span className={styles.star}>★</span>
            {item}
            <span className={styles.accent}>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
