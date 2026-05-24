import styles from './Manifesto.module.css'

export function Manifesto() {
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
          <p>
            Chez Memories, on tatoue depuis dix ans. On a vu trop de gens hésiter, repartir,
            regretter — ou pire, regretter <em>après</em>. Alors on a construit un outil :
            une intelligence artificielle qui essaie le tatouage <em>pour toi</em>, sur
            <em> ton corps</em>, avant même la première aiguille.
          </p>
          <p>
            Photographie-toi en plan large. Approche pour la zone exacte. Choisis dans
            notre catalogue ou amène ton propre dessin. Notre IA fusionne, ajuste,
            projette. Tu reçois deux images : la vue d&apos;ensemble, le détail. Tu décides.
          </p>
          <p>
            C&apos;est gratuit. C&apos;est instantané. C&apos;est <em>fait pour douter</em>.
          </p>
        </div>
      </div>
    </section>
  )
}
