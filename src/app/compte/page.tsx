import Link from 'next/link'
import { requireUser, getProfile } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import styles from './page.module.css'

export const metadata = {
  title: 'Mon espace — Memories°',
  robots: { index: false },
}
export const dynamic = 'force-dynamic'

const FREE_ACCOUNT_TRYOUTS = 2

function frDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_FR: Record<string, string> = {
  pending: 'en attente', generating: 'en cours', done: 'terminé', failed: 'échoué', flagged: 'modéré',
}

export default async function ComptePage() {
  const user = await requireUser()
  const profile = await getProfile()

  const isAdmin = profile?.role === 'admin'
  const subscribed = profile?.subscription_status === 'active'
  const used = profile?.account_tryouts_used ?? 0
  const remaining = subscribed ? '∞' : Math.max(0, FREE_ACCOUNT_TRYOUTS - used)
  const name = profile?.display_name || 'toi'

  // Historique des essayages liés à l'email du compte (best-effort, server-only).
  const admin = createAdminClient()
  const { data: tryouts, count } = await admin
    .from('tryouts')
    .select('session_token, status, created_at', { count: 'exact' })
    .eq('email', user.email ?? '___none___')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className={styles.page}>
      <span className={styles.crumb}><span className={styles.bar} />Mon espace</span>
      <h1 className={styles.title}>Salut, <span className={styles.italic}>{name}</span>.</h1>
      <p className={styles.sub}>{profile?.email ?? user.email}</p>

      {/* Stats */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.label}>Essais restants</span>
          <span className={styles.value}>
            <span className={styles.accent}>{remaining}</span>{' '}
            <small>{subscribed ? 'abonnement actif' : `sur ${FREE_ACCOUNT_TRYOUTS} gratuits`}</small>
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.label}>Abonnement</span>
          <span className={styles.value}>{subscribed ? 'Actif' : 'Gratuit'}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.label}>Essayages réalisés</span>
          <span className={styles.value}>{count ?? 0}</span>
        </div>
      </div>

      {/* Mes essayages */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Mes essayages</h2>
        {tryouts && tryouts.length > 0 ? (
          <div className={styles.list}>
            {tryouts.map((t) => (
              <div key={t.session_token} className={styles.listRow}>
                <div>
                  <div className={styles.rowMain}>Essayage du {frDate(t.created_at)}</div>
                  <div className={styles.rowMeta}>{STATUS_FR[t.status] ?? t.status}</div>
                </div>
                <Link href={`/essayage/${t.session_token}`} className={styles.rowLink}>Voir le rendu →</Link>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyBox}>
            Tes essayages apparaîtront ici. <Link href="/essayage" className={styles.inlineLink}>Lance ton premier →</Link>
          </p>
        )}
      </section>

      {/* Mon compte */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Mon compte</h2>
        <div className={styles.infoGrid}>
          <div><span className={styles.label}>Nom / pseudo</span><span className={styles.infoVal}>{profile?.display_name ?? '—'}</span></div>
          <div><span className={styles.label}>Email</span><span className={styles.infoVal}>{profile?.email ?? user.email}</span></div>
          <div><span className={styles.label}>Membre depuis</span><span className={styles.infoVal}>{frDate(profile?.created_at ?? null)}</span></div>
          {isAdmin && <div><span className={styles.label}>Rôle</span><span className={styles.badge}>Administrateur</span></div>}
        </div>
      </section>

      {/* Raccourcis */}
      <div className={styles.actions}>
        <Link href="/essayage" className={styles.btnPrimary}>Nouvel essayage <span>→</span></Link>
        <Link href="/communaute" className={styles.btnGhost}>Communauté</Link>
        <Link href="/reservation" className={styles.btnGhost}>Réserver</Link>
        {isAdmin && <Link href="/admin" className={styles.btnGhost}>Back office</Link>}
        <form action="/auth/signout" method="post">
          <button type="submit" className={styles.signout}>Se déconnecter</button>
        </form>
      </div>
    </div>
  )
}
