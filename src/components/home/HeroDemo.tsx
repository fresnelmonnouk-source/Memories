import { getContentMap, parseLines } from '@/lib/content'
import styles from './HeroDemo.module.css'

/**
 * Démo avant/après auto-animée pour le hero (CSS pur, déterministe).
 * URLs éditables depuis l'admin (bloc `home_hero_demo`), défaut = /public/hero.
 * Décorative (aria-hidden) — l'essayage réel et interactif est sur /essayage.
 */
export async function HeroDemo() {
  const map = await getContentMap(['home_hero_demo'])
  const urls = parseLines(map.home_hero_demo)
  const before = urls[0] || '/hero/demo-before.webp'
  const after = urls[1] || '/hero/demo-after.png'

  return (
    <div className={styles.demo} aria-hidden="true">
      <img src={before} alt="" className={styles.img} />
      <div className={styles.afterLayer}>
        <img src={after} alt="" className={styles.img} />
      </div>
      <div className={styles.divider} />
      <span className={`${styles.tag} ${styles.tagBefore}`}>Avant</span>
      <span className={`${styles.tag} ${styles.tagAfter}`}>Après</span>
      <span className={styles.caption}>Essayage IA · aperçu</span>
    </div>
  )
}
