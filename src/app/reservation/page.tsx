import { createClient } from '@/lib/supabase/server'
import { BookingForm } from '@/components/booking/BookingForm'
import styles from './page.module.css'

export const metadata = {
  title: 'Réserver — Memories°',
  description: 'Réserve ta séance au studio Memories.',
}

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ artist?: string; tryout?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: artists } = await supabase
    .from('artists')
    .select('id, name, slug, primary_style')
    .eq('is_active', true)
    .order('display_order')

  // Récupérer le tryout si présent (session_token dans l'URL)
  let tryoutId: string | undefined
  if (params.tryout) {
    const { data: t } = await supabase
      .from('tryouts')
      .select('id')
      .eq('session_token', params.tryout)
      .single()
    tryoutId = t?.id
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.crumb}>
          <span className={styles.bar} />
          Atelier · Prendre rendez-vous
        </div>
        <h1 className={styles.title}>
          On <span className={styles.italic}>se voit</span><br/>
          à l&apos;atelier ?
        </h1>
        <p className={styles.intro}>
          Réponse sous 24h ouvrées. La consultation est toujours gratuite —
          on en profitera pour caler la taille, l&apos;emplacement, le délai.
        </p>
      </header>

      <BookingForm
        artists={artists ?? []}
        preselectedArtistId={params.artist}
        tryoutId={tryoutId}
      />
    </div>
  )
}
