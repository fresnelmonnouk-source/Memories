import styles from './Process.module.css'

const STEPS = [
  { num: '01', name: 'Capture',    desc: 'Deux photos : plan large pour la silhouette, gros plan pour la zone exacte. Lumière naturelle de préférence, peau visible.', time: '≈ 90 secondes' },
  { num: '02', name: 'Choix',      desc: "Parcours notre catalogue de 124 motifs originaux ou téléverse ta propre référence. Tu peux ajuster la taille avant génération.", time: '≈ 2 minutes' },
  { num: '03', name: 'Fusion',     desc: "L'IA Memories respecte la morphologie, la lumière, la texture cutanée. Elle ne triche pas — tu vois le rendu réel à 98%.", time: '≈ 15 secondes' },
  { num: '04', name: 'Décision',   desc: 'Tu reçois les deux rendus. Tu peux les sauver, les partager, les regarder dormir dessus. Ou prendre rendez-vous.', time: '≈ infini' },
  { num: '05', name: 'Aiguille',   desc: "Rendez-vous à l'atelier. L'artiste reprend la référence générée, l'affine, et grave. Cette fois pour de bon.", time: 'selon projet' },
]

export function Process() {
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
        {STEPS.map((s) => (
          <div key={s.num} className={styles.row} data-reveal>
            <span className={styles.num}>/ {s.num}</span>
            <span className={styles.name}>{s.name}</span>
            <span className={styles.desc}>{s.desc}</span>
            <span className={styles.time}>{s.time}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
