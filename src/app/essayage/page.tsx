import { createClient } from '@/lib/supabase/server'
import { TryonLab } from '@/components/tryon/TryonLab'
import styles from './page.module.css'

export const metadata = {
  title: 'Essayage IA — Memories°',
  description: "Essaie virtuellement ton tatouage sur ton corps avec notre IA, avant même de prendre rendez-vous.",
}

export default async function EssayagePage() {
  const supabase = await createClient()
  const { data: tattoos } = await supabase
    .from('tattoos')
    .select('id, slug, name, image_url, thumbnail_url, style, size_label')
    .eq('is_active', true)
    .order('display_order')
    .limit(20)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.crumb}>
          <span className={styles.bar} />
          Atelier IA · Essayage augmenté
        </div>
        <h1 className={styles.title}>
          <span className={styles.small}>Trois étapes · Quatre photos · Une décision</span>
          <span><span className={styles.italic}>Lab</span>oratoire</span>
          <span>d&apos;encre.</span>
        </h1>
        <p className={styles.intro}>
          L&apos;algorithme respecte ta morphologie, la lumière, la texture de peau —
          le rendu est aussi proche du réel qu&apos;un essai chez nous.
        </p>
      </header>

      <TryonLab tattoos={tattoos ?? []} />
    </div>
  )
}
