import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUser, getProfile } from '@/lib/auth'
import { approveCommunityPost, deleteCommunityPost } from './actions'
import { CommunityComposer } from './CommunityComposer'
import styles from './page.module.css'

export const metadata = {
  title: 'Communauté — Memories°',
  description: 'Les histoires d\'encre de la communauté Memories. Raconte la tienne.',
}

export const dynamic = 'force-dynamic'

function frDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function CommunautePage() {
  const user = await getUser()
  const profile = user ? await getProfile() : null
  const isAdmin = profile?.role === 'admin'

  // Admin : voit tout (y compris flagged) via service_role. Public : RLS = approved only.
  const db = isAdmin ? createAdminClient() : await createClient()
  const { data: posts } = await db
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className={styles.page}>
      <span className={styles.crumb}><span className={styles.bar} />Communauté · histoires d&apos;encre</span>
      <h1 className={styles.title}>L&apos;encre <span className={styles.italic}>raconte</span>.</h1>
      <p className={styles.intro}>
        Ton tatouage a une histoire. Une anecdote, un sens, un moment. Partage-la —
        et lis celles des autres.
      </p>

      {user ? (
        <CommunityComposer />
      ) : (
        <div className={styles.loginCta}>
          <Link href="/connexion?next=/communaute">Connecte-toi</Link> ou{' '}
          <Link href="/inscription">crée un compte</Link> pour partager ton histoire.
        </div>
      )}

      <div className={styles.feed}>
        {posts?.map((p) => (
          <article key={p.id} className={`${styles.post} ${p.status === 'flagged' ? styles.postFlagged : ''}`}>
            <div className={styles.postHead}>
              <span className={styles.author}>{p.author_name}</span>
              <span className={styles.date}>{frDate(p.created_at)}</span>
            </div>
            <p className={styles.body}>{p.body}</p>
            {isAdmin && (
              <div className={styles.modRow}>
                {p.status === 'flagged' && <span className={styles.flaggedBadge}>à valider</span>}
                {p.status === 'flagged' && (
                  <form action={approveCommunityPost}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className={styles.approve}>Approuver</button>
                  </form>
                )}
                <form action={deleteCommunityPost}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className={styles.del}>Supprimer</button>
                </form>
              </div>
            )}
          </article>
        ))}

        {(!posts || posts.length === 0) && (
          <p className={styles.empty}>Aucune histoire pour le moment. Sois le premier.</p>
        )}
      </div>
    </div>
  )
}
