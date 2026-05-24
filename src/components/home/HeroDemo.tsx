import styles from './HeroDemo.module.css'

// Paire avant/après du hero. Fresnel doit déposer 2 fichiers dans /public/hero/ :
//   demo-before.jpg = photo de corps (dos nu)         ← fournie
//   demo-after.jpg  = le rendu IA correspondant (roses) ← fournie
// (plan large recommandé). Tant que les fichiers ne sont pas là, l'image 404 —
// pas d'erreur de build. Pour changer de visuel : remplacer ces 2 fichiers.
const BEFORE_SRC = '/hero/demo-before.webp'
const AFTER_SRC = '/hero/demo-after.png'

/**
 * Démo avant/après auto-animée pour le hero (CSS pur, déterministe).
 * Décorative (aria-hidden) — l'essayage réel et interactif est sur /essayage.
 */
export function HeroDemo() {
  return (
    <div className={styles.demo} aria-hidden="true">
      <img src={BEFORE_SRC} alt="" className={styles.img} />
      <div className={styles.afterLayer}>
        <img src={AFTER_SRC} alt="" className={styles.img} />
      </div>
      <div className={styles.divider} />
      <span className={`${styles.tag} ${styles.tagBefore}`}>Avant</span>
      <span className={`${styles.tag} ${styles.tagAfter}`}>Après</span>
      <span className={styles.caption}>Essayage IA · aperçu</span>
    </div>
  )
}
