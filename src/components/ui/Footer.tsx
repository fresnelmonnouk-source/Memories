import Link from 'next/link'
import { getContentMap, parseLines, parsePipes } from '@/lib/content'
import styles from './Footer.module.css'

export async function Footer() {
  const map = await getContentMap(['footer_address', 'footer_socials'])
  const address = parseLines(map.footer_address)
  const socials = parsePipes(map.footer_socials)
  return (
    <footer className={styles.footer}>
      <h2 className={styles.mega}>
        <span className={styles.italic}>Memories</span>
        <sup>°</sup>
      </h2>

      <div className={styles.grid}>
        <div className={styles.col}>
          <h4>L&apos;atelier</h4>
          {address.map((line, i) => <p key={i} className={i === 0 ? styles.big : undefined}>{line}</p>)}
        </div>
        <div className={styles.col}>
          <h4>Navigation</h4>
          <Link href="/essayage">Essayage IA</Link>
          <Link href="/catalogue">Catalogue</Link>
          <Link href="/realisations">Réalisations</Link>
          <Link href="/journal">Journal</Link>
          <Link href="/communaute">Communauté</Link>
          <Link href="/a-propos">L&apos;atelier</Link>
          <Link href="/reservation">Réserver</Link>
        </div>
        <div className={styles.col}>
          <h4>Pratique</h4>
          <Link href="/a-propos#soins">Soins post-tatouage</Link>
          <Link href="/a-propos#tarifs">Tarifs</Link>
          <Link href="/a-propos#faq">FAQ</Link>
          <Link href="/legal/mentions-legales">Mentions légales</Link>
          <Link href="/legal/confidentialite">Confidentialité</Link>
        </div>
        <div className={styles.col}>
          <h4>Suivre</h4>
          {socials.map((s, i) => (
            <a key={i} href={s[1] ?? '#'} target="_blank" rel="noopener">{s[0]} ↗</a>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Memories Atelier · Tous droits réservés</span>
        <span className={styles.star}>✦ Designed in ink &amp; pixels ✦</span>
        <Link href="/legal/cgv">CGV</Link>
      </div>
    </footer>
  )
}
