import Link from 'next/link'
import { HeroDemo } from './HeroDemo'
import { getContentMap, parseLines, parsePipes } from '@/lib/content'
import styles from './Hero.module.css'

export async function Hero() {
  const map = await getContentMap(['home_hero_title', 'home_hero_desc', 'home_hero_cta', 'home_hero_stat'])
  const titleLines = parseLines(map.home_hero_title)
  const stat = parsePipes(map.home_hero_stat)[0] ?? ['98%', 'de fidélité au rendu final']

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
          {titleLines.map((line, i) => (
            <span key={i} className={styles.line}>
              {i === 1 ? <span className={styles.italic}>{line}</span> : line}
            </span>
          ))}
        </h1>

        <HeroDemo />
      </div>

      <div className={styles.bottom}>
        <div className={styles.desc}>{map.home_hero_desc}</div>
        <Link href="/essayage" className={styles.cta}>
          <span className={styles.arrow}>→</span>
          {map.home_hero_cta}
        </Link>
        <div className={styles.stats}>
          <span className={styles.num}>{stat[0]}</span>
          <span className={styles.label}>{stat[1]}</span>
        </div>
      </div>
    </section>
  )
}
