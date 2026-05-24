import styles from './loading.module.css'

export default function Loading() {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.inner}>
        <span className={styles.dot} />
        <span className={styles.label}>Memories° · chargement</span>
      </div>
      <span className={styles.sr}>Chargement en cours…</span>
    </div>
  )
}
