import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { TATTOO_STYLE_LABELS } from '@/lib/utils'
import { getContentMap, parseLines, parsePipes } from '@/lib/content'
import styles from './page.module.css'

export const metadata = {
  title: 'L\'atelier — Memories°',
  description: 'L\'atelier Memories : nos artistes, notre vision, nos soins, nos tarifs.',
}

export default async function AProposPage() {
  const supabase = await createClient()
  const { data: artists } = await supabase
    .from('artists')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  const content = await getContentMap([
    'apropos_vision', 'apropos_soins', 'apropos_tarifs', 'apropos_tarifs_note', 'apropos_faq',
  ])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.crumb}>
          <span className={styles.bar} />
          L&apos;atelier · Manifeste
        </div>
        <h1 className={styles.title}>
          On tatoue<br/>
          des <span className={styles.italic}>mémoires</span>.<br/>
          Pas des modes.
        </h1>
      </header>

      {/* Artistes (fusion avec l'ancienne page Artistes) */}
      <section className={styles.section} id="artistes">
        <div className={styles.label}>00 · Nos artistes</div>
        <div className={styles.body}>
          <div className={styles.artists}>
            {artists?.map((a) => (
              <article key={a.id} className={styles.artist}>
                <div className={styles.artistPortrait}>
                  {a.portrait_url
                    ? <Image src={a.portrait_url} alt={a.name} fill sizes="88px" />
                    : <span>{a.name.split(' ').map((n) => n[0]).join('')}</span>}
                </div>
                <div>
                  <h3 className={styles.artistName}>{a.name}</h3>
                  <div className={styles.artistStyles}>
                    {a.styles?.map((s) => <span key={s}>{TATTOO_STYLE_LABELS[s]}</span>)}
                  </div>
                  {a.bio && <p className={styles.artistBio}>{a.bio}</p>}
                  <Link href={`/reservation?artist=${a.id}`} className={styles.artistCta}>
                    Réserver avec {a.name.split(' ')[0]} →
                  </Link>
                </div>
              </article>
            ))}
            {(!artists || artists.length === 0) && (
              <p className={styles.artistBio}>L&apos;équipe se constitue. Reviens vite.</p>
            )}
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className={styles.section}>
        <div className={styles.label}>01 · Notre vision</div>
        <div className={styles.body}>
          {content.apropos_vision.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
        </div>
      </section>

      {/* Soins */}
      <section className={styles.section} id="soins">
        <div className={styles.label}>02 · Soins post-tatouage</div>
        <div className={styles.body}>
          <ul className={styles.list}>
            {parseLines(content.apropos_soins).map((line, i) => {
              const idx = line.indexOf(' · ')
              const strong = idx >= 0 ? line.slice(0, idx) : ''
              const rest = idx >= 0 ? line.slice(idx + 3) : line
              return <li key={i}>{strong && <strong>{strong}</strong>}{strong ? ' · ' : ''}{rest}</li>
            })}
          </ul>
        </div>
      </section>

      {/* Tarifs */}
      <section className={styles.section} id="tarifs">
        <div className={styles.label}>03 · Tarifs indicatifs</div>
        <div className={styles.tarifs}>
          {parsePipes(content.apropos_tarifs).map((c, i) => (
            <div key={i} className={styles.tarif}>
              <h3>{c[0]}</h3>
              <p className={styles.size}>{c[1]}</p>
              <p className={styles.price}>{c[2]}</p>
            </div>
          ))}
        </div>
        <p className={styles.note}>✦ {content.apropos_tarifs_note}</p>
      </section>

      {/* FAQ */}
      <section className={styles.section} id="faq">
        <div className={styles.label}>04 · FAQ</div>
        <div className={styles.body}>
          {parsePipes(content.apropos_faq).map((qa, i) => (
            <details key={i} className={styles.faq}>
              <summary>{qa[0]}</summary>
              <p>{qa[1]}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Mentions */}
      <section className={styles.section} id="mentions">
        <div className={styles.label}>05 · Mentions légales</div>
        <div className={styles.body}>
          <p><strong>Memories Atelier</strong> · 14, rue des Bains, Quartier Adidogomé, Lomé · Togo</p>
          <p>RCCM TG-LOM 2026 B XXXX · Hébergement : Vercel Inc.</p>
          <p>Tatouage interdit aux mineurs. Autorisation parentale obligatoire pour les 16-18 ans.</p>
        </div>
      </section>
    </div>
  )
}
