import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser, getProfile } from '@/lib/auth'
import { addCommunityPost, deleteCommunityPost } from './actions'
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
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const user = await getUser()
  const profile = user ? await getProfile() : null
  const isAdmin = profile?.role === 'admin'

  return (
    <div className={styles.page}>
      <span className={styles.crumb}><span className={styles.bar} />Communauté · histoires d&apos;encre</span>
      <h1 className={styles.title}>L&apos;encre <span className={styles.italic}>raconte</span>.</h1>
      <p className={styles.intro}>
        Ton tatouage a une histoire. Une anecdote, un sens, un moment. Partage-la —
        et lis celles des autres.
      </p>

      {user ? (
        <form action={addCommunityPost} className={styles.composer}>
          <textarea name="body" placeholder="Raconte l'histoire de ton tatouage…" maxLength={2000} required />
          <div className={styles.composerFoot}>
            <span className={styles.hint}>Public · 2000 caractères max</span>
            <button type="submit" className={styles.submit}>Publier</button>
          </div>
        </form>
      ) : (
        <div className={styles.loginCta}>
          <Link href="/connexion?next=/communaute">Connecte-toi</Link> ou{' '}
          <Link href="/inscription">crée un compte</Link> pour partager ton histoire.
        </div>
      )}

      <div className={styles.feed}>
        {posts?.map((p) => (
          <article key={p.id} className={styles.post}>
            <div className={styles.postHead}>
              <span className={styles.author}>{p.author_name}</span>
              <span className={styles.date}>{frDate(p.created_at)}</span>
            </div>
            <p className={styles.body}>{p.body}</p>
            {isAdmin && (
              <form action={deleteCommunityPost} style={{ marginTop: 12 }}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className={styles.del}>Supprimer</button>
              </form>
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
