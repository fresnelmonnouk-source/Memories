import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { TATTOO_STYLE_LABELS, formatPrice } from '@/lib/utils'
import type { TattooStyle } from '@/types/database'
import styles from './page.module.css'

export const metadata = {
  title: 'Catalogue — Memories°',
  description: 'Notre catalogue de tatouages originaux dessinés par les artistes Memories.',
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ style?: TattooStyle }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('tattoos')
    .select('id, slug, name, description, image_url, thumbnail_url, style, size_label, base_price_eur')
    .eq('is_active', true)
    .order('display_order')

  if (params.style) query = query.eq('style', params.style)

  const { data: tattoos } = await query

  const styleKeys = Object.keys(TATTOO_STYLE_LABELS) as TattooStyle[]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.crumb}>
          <span className={styles.bar} />
          Catalogue · {tattoos?.length ?? 0} motifs
        </div>
        <h1 className={styles.title}>
          <span className={styles.italic}>Cata</span>logue<br/>
          d&apos;encre.
        </h1>
        <p className={styles.intro}>
          Motifs originaux dessinés par les artistes Memories. Chaque pièce est unique :
          on ne refait pas deux fois le même tatouage. Tu peux essayer chacun via l&apos;IA.
        </p>
      </header>

      <nav className={styles.filters}>
        <Link href="/catalogue" className={!params.style ? styles.filterActive : styles.filter}>
          Tous
        </Link>
        {styleKeys.map((s) => (
          <Link
            key={s}
            href={`/catalogue?style=${s}`}
            className={params.style === s ? styles.filterActive : styles.filter}
          >
            {TATTOO_STYLE_LABELS[s]}
          </Link>
        ))}
      </nav>

      <div className={styles.grid}>
        {tattoos?.map((t) => (
          <article key={t.id} className={styles.card} data-reveal>
            <div className={styles.cardImg}>
              {t.image_url ? (
                <Image src={t.thumbnail_url ?? t.image_url} alt={t.name} fill sizes="(max-width: 880px) 50vw, 280px" />
              ) : (
                <div className={styles.placeholder}>{t.name.charAt(0)}</div>
              )}
              <span className={styles.tag}>{t.style ? TATTOO_STYLE_LABELS[t.style] : ''}</span>
            </div>
            <div className={styles.cardBody}>
              <h3>{t.name}</h3>
              <div className={styles.meta}>
                <span>{t.size_label ?? '—'}</span>
                <span>{formatPrice(t.base_price_eur)}</span>
              </div>
            </div>
          </article>
        ))}

        {(!tattoos || tattoos.length === 0) && (
          <p className={styles.empty}>
            Aucun motif dans cette catégorie pour le moment.
          </p>
        )}
      </div>
    </div>
  )
}
