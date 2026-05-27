import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { TATTOO_STYLE_LABELS, BODY_ZONE_LABELS } from '@/lib/utils'
import styles from './page.module.css'

export const metadata = {
  title: 'Nos réalisations — Memories°',
  description: 'Galerie des travaux réalisés par les artistes du studio Memories.',
}

export default async function RealisationsPage() {
  const supabase = await createClient()
  const { data: works } = await supabase
    .from('realisations')
    .select('*, artist:artists(name, slug)')
    .eq('is_active', true)
    .order('display_order')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.crumb}>
          <span className={styles.bar} />
          Portfolio · {works?.length ?? 0} pièces
        </div>
        <h1 className={styles.title}>
          Nos<br/>
          <span className={styles.italic}>réalisations</span>.
        </h1>
        <p className={styles.intro}>
          Chaque tatouage est une histoire qui s&apos;inscrit dans la peau.
          Voici quelques-unes des nôtres.
        </p>
      </header>

      <div className={styles.masonry}>
        {works?.map((w, i) => (
          <article
            key={w.id}
            className={`${styles.item} ${i % 5 === 0 ? styles.tall : ''} ${i % 7 === 0 ? styles.wide : ''}`}
            data-reveal
          >
            <div className={styles.imgWrap}>
              {w.image_url ? (
                <Image src={w.image_url} alt={w.title} fill sizes="(max-width: 880px) 50vw, 25vw" />
              ) : (
                <div className={styles.placeholder}>{w.title.charAt(0)}</div>
              )}
            </div>
            <div className={styles.overlay}>
              <h3>{w.title}</h3>
              <div className={styles.tags}>
                {w.style && <span>{TATTOO_STYLE_LABELS[w.style]}</span>}
                {w.body_zone && <span>{BODY_ZONE_LABELS[w.body_zone]}</span>}
                {/* @ts-expect-error - join returns nested */}
                {w.artist?.name && <span>par {w.artist.name}</span>}
              </div>
            </div>
          </article>
        ))}

        {(!works || works.length === 0) && (
          <p className={styles.empty}>
            Galerie en cours de constitution. Reviens vite.
          </p>
        )}
      </div>
    </div>
  )
}
