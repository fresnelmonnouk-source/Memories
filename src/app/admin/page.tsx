import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import styles from '../compte/page.module.css'

export const metadata = { title: 'Back office — Memories°', robots: { index: false } }
export const dynamic = 'force-dynamic'

const MODULES: { name: string; href?: string; note: string }[] = [
  { name: 'Catalogue', href: '/admin/catalogue', note: 'gérer →' },
  { name: 'Réservations', href: '/admin/reservations', note: 'gérer →' },
  { name: 'Artistes', href: '/admin/artistes', note: 'gérer →' },
  { name: 'Réalisations', href: '/admin/realisations', note: 'gérer →' },
  { name: 'Mini-blog', href: '/admin/journal', note: 'gérer →' },
  { name: 'Communauté', href: '/communaute', note: 'modérer →' },
  { name: 'Contenu légal', note: 'à venir' },
]

function frDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

async function countOf(admin: ReturnType<typeof createAdminClient>, table: string) {
  const { count } = await admin.from(table as 'tattoos').select('*', { count: 'exact', head: true })
  return count ?? 0
}

export default async function AdminPage() {
  const profile = await requireAdmin()
  const admin = createAdminClient()

  const [tattoos, artists, realisations, bookings, blog, community, tryouts] = await Promise.all([
    countOf(admin, 'tattoos'),
    countOf(admin, 'artists'),
    countOf(admin, 'realisations'),
    countOf(admin, 'bookings'),
    countOf(admin, 'blog_posts'),
    countOf(admin, 'community_posts'),
    countOf(admin, 'tryouts'),
  ])

  const { data: recentBookings } = await admin
    .from('bookings')
    .select('first_name, last_name, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Essayages', value: tryouts },
    { label: 'Réservations', value: bookings },
    { label: 'Motifs', value: tattoos },
    { label: 'Artistes', value: artists },
    { label: 'Réalisations', value: realisations },
    { label: 'Articles', value: blog },
    { label: 'Posts communauté', value: community },
  ]

  return (
    <div className={styles.page}>
      <span className={styles.crumb}><span className={styles.bar} />Back office</span>
      <h1 className={styles.title}>Console <span className={styles.italic}>Memories</span>.</h1>
      <p className={styles.sub}>Administrateur · {profile.email}</p>

      {/* Stats */}
      <div className={styles.grid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.card}>
            <span className={styles.label}>{s.label}</span>
            <span className={styles.value}><span className={styles.accent}>{s.value}</span></span>
          </div>
        ))}
      </div>

      {/* Modules */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Modules</h2>
        <div className={styles.modules}>
          {MODULES.map((m) =>
            m.href ? (
              <Link key={m.name} href={m.href} className={styles.module}>
                <span className={styles.moduleName}>{m.name}</span>
                <span className={styles.soon} data-active="true">{m.note}</span>
              </Link>
            ) : (
              <div key={m.name} className={styles.module}>
                <span className={styles.moduleName}>{m.name}</span>
                <span className={styles.soon}>{m.note}</span>
              </div>
            ),
          )}
        </div>
      </section>

      {/* Réservations récentes */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Réservations récentes</h2>
        {recentBookings && recentBookings.length > 0 ? (
          <div className={styles.list}>
            {recentBookings.map((b, i) => (
              <div key={i} className={styles.listRow}>
                <div>
                  <div className={styles.rowMain}>{b.first_name} {b.last_name}</div>
                  <div className={styles.rowMeta}>{b.status} · {frDate(b.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyBox}>Aucune réservation pour l&apos;instant.</p>
        )}
      </section>

      <div className={styles.actions}>
        <Link href="/compte" className={styles.btnGhost}>Mon espace</Link>
        <form action="/auth/signout" method="post">
          <button type="submit" className={styles.signout}>Se déconnecter</button>
        </form>
      </div>
    </div>
  )
}
