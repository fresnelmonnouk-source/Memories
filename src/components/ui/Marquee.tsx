import styles from './Marquee.module.css'

const ITEMS = [
  'Atelier ouvert mar—sam · 11h—20h',
  'Essayage IA disponible 24/7',
  'Première consultation gratuite',
  'Prends rendez-vous · 48h de délai',
]

export function Marquee() {
  // Dupliqué pour boucle fluide
  const all = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS]

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
