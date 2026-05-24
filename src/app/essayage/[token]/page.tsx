import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import styles from './page.module.css'

export const metadata = {
  title: 'Ton essayage — Memories°',
  description: 'Le rendu de ton essayage virtuel.',
}

// Page lecture-seule d'un essayage, atteignable via le lien partagé dans l'email
// (`/essayage/<session_token>`). Server Component → l'admin client (service_role)
// reste côté serveur et ne fuit jamais dans le bundle.
export default async function TryoutResultPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = createAdminClient()

  const { data: tryout } = await supabase
    .from('tryouts')
    .select('session_token, status, result_wide_path, result_close_path')
    .eq('session_token', token)
    .maybeSingle()

  if (!tryout) notFound()

  let wideUrl: string | undefined
  let closeUrl: string | undefined
  if (tryout.status === 'done' && tryout.result_wide_path && tryout.result_close_path) {
    const [w, c] = await Promise.all([
      supabase.storage.from('results').createSignedUrl(tryout.result_wide_path, 60 * 60 * 24 * 7),
      supabase.storage.from('results').createSignedUrl(tryout.result_close_path, 60 * 60 * 24 * 7),
    ])
    wideUrl = w.data?.signedUrl
    closeUrl = c.data?.signedUrl
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.crumb}>
          <span className={styles.bar} />
          Essayage · {token.slice(0, 8)}
        </div>
        <h1 className={styles.title}>
          Ton <span className={styles.italic}>rendu</span>.
        </h1>
      </header>

      {wideUrl && closeUrl ? (
        <>
          <div className={styles.grid}>
            <figure className={styles.card}>
              <figcaption>Plan large</figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={wideUrl} alt="Rendu plan large" />
            </figure>
            <figure className={styles.card}>
              <figcaption>Gros plan</figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={closeUrl} alt="Rendu gros plan" />
            </figure>
          </div>
          <div className={styles.actions}>
            <Link href={`/reservation?tryout=${token}`} className={styles.cta}>
              Réserver maintenant <span>→</span>
            </Link>
          </div>
        </>
      ) : (
        <p className={styles.empty}>
          {tryout.status === 'generating'
            ? 'Ton essayage est encore en cours de génération. Reviens dans un instant.'
            : 'Ce rendu n’est plus disponible ou a expiré.'}
        </p>
      )}
    </div>
  )
}
