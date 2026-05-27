import Link from 'next/link'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <h2 className={styles.mega}>
        <span className={styles.italic}>Memories</span>
        <sup>°</sup>
      </h2>

      <div className={styles.grid}>
        <div className={styles.col}>
          <h4>L&apos;atelier</h4>
          <p className={styles.big}>14, rue des Bains<br />Lomé · Maritime</p>
          <p style={{ marginTop: 14 }}>Quartier Adidogomé<br />Togo</p>
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
          <a href="https://instagram.com" target="_blank" rel="noopener">Instagram ↗</a>
          <a href="https://tiktok.com" target="_blank" rel="noopener">TikTok ↗</a>
          <a href="https://behance.net" target="_blank" rel="noopener">Behance ↗</a>
          <a href="#newsletter">Newsletter ↗</a>
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
