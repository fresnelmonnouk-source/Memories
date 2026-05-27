'use client'

import { useState } from 'react'
import styles from './page.module.css'

function useRedirect() {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  async function go(endpoint: string) {
    setErr(null)
    setBusy(true)
    try {
      const res = await fetch(endpoint, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Erreur, réessaie.')
      window.location.assign(data.url)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur')
      setBusy(false)
    }
  }
  return { busy, err, go }
}

export function SubscribeButton() {
  const { busy, err, go } = useRedirect()
  return (
    <>
      <button className={styles.cta} onClick={() => go('/api/stripe/checkout')} disabled={busy}>
        {busy ? 'Redirection…' : 'S\'abonner — 4 €/mois'}
      </button>
      {err && <p className={styles.err}>{err}</p>}
    </>
  )
}

export function ManageButton() {
  const { busy, err, go } = useRedirect()
  return (
    <>
      <button className={styles.ghost} onClick={() => go('/api/stripe/portal')} disabled={busy}>
        {busy ? 'Redirection…' : 'Gérer mon abonnement'}
      </button>
      {err && <p className={styles.err}>{err}</p>}
    </>
  )
}
