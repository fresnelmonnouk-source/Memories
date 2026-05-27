import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { TATTOO_STYLE_LABELS } from '@/lib/utils'
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
          <p>
            Memories est né d&apos;une obsession : faire en sorte qu&apos;un tatouage
            ne soit jamais un regret. On a commencé par poser des aiguilles
            avec rigueur. Puis on a construit un outil pour éviter les hésitations
            de dernière minute.
          </p>
          <p>
            Notre IA ne remplace pas l&apos;artiste — elle l&apos;accompagne.
            Tu visualises, tu doutes moins, tu décides mieux. L&apos;atelier
            prend le relais quand tu es prêt.e.
          </p>
        </div>
      </section>

      {/* Soins */}
      <section className={styles.section} id="soins">
        <div className={styles.label}>02 · Soins post-tatouage</div>
        <div className={styles.body}>
          <ul className={styles.list}>
            <li><strong>Jour 1-3</strong> · Laisser le pansement 4h. Nettoyer à l&apos;eau tiède, savon neutre. Sécher en tapotant.</li>
            <li><strong>Jour 4-14</strong> · Crème cicatrisante 2-3× par jour. Ne pas gratter même si ça démange.</li>
            <li><strong>Mois 1-2</strong> · Pas de soleil direct, pas de piscine, pas de bain prolongé.</li>
            <li><strong>À vie</strong> · Hydratation, protection solaire SPF 50+ sur la zone tatouée.</li>
          </ul>
        </div>
      </section>

      {/* Tarifs */}
      <section className={styles.section} id="tarifs">
        <div className={styles.label}>03 · Tarifs indicatifs</div>
        <div className={styles.tarifs}>
          <div className={styles.tarif}>
            <h3>XS</h3>
            <p className={styles.size}>moins de 4 cm</p>
            <p className={styles.price}>à partir de 80 €</p>
          </div>
          <div className={styles.tarif}>
            <h3>S—M</h3>
            <p className={styles.size}>4 à 12 cm</p>
            <p className={styles.price}>120 à 250 €</p>
          </div>
          <div className={styles.tarif}>
            <h3>L</h3>
            <p className={styles.size}>15 à 25 cm</p>
            <p className={styles.price}>300 à 500 €</p>
          </div>
          <div className={styles.tarif}>
            <h3>XL</h3>
            <p className={styles.size}>grandes pièces, sleeves, dos</p>
            <p className={styles.price}>sur devis</p>
          </div>
        </div>
        <p className={styles.note}>
          ✦ Première consultation toujours gratuite. L&apos;essayage IA aussi.
        </p>
      </section>

      {/* FAQ */}
      <section className={styles.section} id="faq">
        <div className={styles.label}>04 · FAQ</div>
        <div className={styles.body}>
          <details className={styles.faq}>
            <summary>L&apos;essayage IA est-il vraiment réaliste ?</summary>
            <p>Oui. Notre modèle respecte ta morphologie, la lumière de la photo et la texture de peau. Le rendu est à ~98% du résultat final.</p>
          </details>
          <details className={styles.faq}>
            <summary>Mes photos sont-elles stockées ?</summary>
            <p>Tes photos sont chiffrées et automatiquement supprimées 30 jours après ton essayage. Personne d&apos;autre que toi ne peut y accéder.</p>
          </details>
          <details className={styles.faq}>
            <summary>Combien de temps faut-il pour prendre rendez-vous ?</summary>
            <p>Selon l&apos;artiste choisi : entre 2 et 8 semaines. Pour les grosses pièces, prévois 1 à 3 mois.</p>
          </details>
          <details className={styles.faq}>
            <summary>Acceptez-vous les modifications de design ?</summary>
            <p>Oui. L&apos;essayage IA est une base. L&apos;artiste affine, adapte, sublime ta vision en consultation.</p>
          </details>
          <details className={styles.faq}>
            <summary>Faites-vous des retouches ?</summary>
            <p>Une retouche gratuite est incluse dans les 2 mois suivant le tatouage si nécessaire.</p>
          </details>
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
