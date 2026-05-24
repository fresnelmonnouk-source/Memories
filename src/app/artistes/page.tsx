import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TATTOO_STYLE_LABELS } from '@/lib/utils'
import styles from './page.module.css'

export const metadata = {
  title: 'Artistes — Memories°',
  description: 'Les artistes du studio Memories. Six aiguilles. Six visions.',
}

export default async function ArtistesPage() {
  const supabase = await createClient()
  const { data: artists } = await supabase
    .from('artists')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.crumb}>
          <span className={styles.bar} />
          L&apos;atelier · {artists?.length ?? 0} signatures
        </div>
        <h1 className={styles.title}>
          Six<br/>
          <span className={styles.italic}>aiguilles</span>.<br/>
          Six visions.
        </h1>
        <p className={styles.intro}>
          Chaque artiste de l&apos;atelier porte son style, son langage, son obsession.
          Choisis celui qui correspond à ton projet — ou laisse-nous t&apos;orienter.
        </p>
      </header>

      <div className={styles.grid}>
        {artists?.map((a) => (
          <article key={a.id} className={styles.card} data-reveal>
            <div className={styles.portrait}>
              {a.portrait_url ? (
                <img src={a.portrait_url} alt={a.name} />
              ) : (
                <div className={styles.placeholder}>
                  {a.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <span className={styles.years}>{a.years_experience}<br/>ans</span>
            </div>
            <div className={styles.body}>
              <h2>{a.name}</h2>
              <div className={styles.styles}>
                {a.styles?.map((s) => (
                  <span key={s}>{TATTOO_STYLE_LABELS[s]}</span>
                ))}
              </div>
              {a.bio && <p>{a.bio}</p>}
              <div className={styles.cardActions}>
                {a.instagram && (
                  <a href={`https://instagram.com/${a.instagram}`} target="_blank" rel="noopener">
                    Instagram ↗
                  </a>
                )}
                <Link href={`/reservation?artist=${a.id}`}>
                  Réserver avec {a.name.split(' ')[0]} →
                </Link>
              </div>
            </div>
          </article>
        ))}

        {(!artists || artists.length === 0) && (
          <p className={styles.empty}>L&apos;équipe se constitue. Reviens vite.</p>
        )}
      </div>
    </div>
  )
}
