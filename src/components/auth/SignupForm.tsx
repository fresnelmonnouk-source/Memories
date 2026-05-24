'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './AuthForm.module.css'

export function SignupForm() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsConfirm, setNeedsConfirm] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) {
      setError(error.message === 'User already registered'
        ? 'Un compte existe déjà avec cet email.'
        : 'Inscription impossible. Réessaie.')
      setLoading(false)
      return
    }
    // Si la confirmation email est activée, pas de session immédiate.
    if (!data.session) {
      setNeedsConfirm(true)
      setLoading(false)
      return
    }
    window.location.assign('/compte')
  }

  if (needsConfirm) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <span className={styles.crumb}><span className={styles.bar} />Inscription</span>
          <h1 className={styles.title}>Vérifie<br /><span className={styles.italic}>tes mails</span>.</h1>
          <p className={styles.notice}>
            On vient de t&apos;envoyer un lien de confirmation à <strong>{email}</strong>.
            Clique dessus pour activer ton compte, puis connecte-toi.
          </p>
          <p className={styles.alt}><Link href="/connexion">Aller à la connexion</Link></p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <span className={styles.crumb}><span className={styles.bar} />Inscription</span>
        <h1 className={styles.title}>Crée ton<br /><span className={styles.italic}>compte</span>.</h1>
        <p className={styles.intro}>Un compte débloque 2 essayages gratuits supplémentaires et garde l&apos;historique de tes rendus.</p>

        <form className={styles.form} onSubmit={onSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">Prénom / pseudo</label>
            <input id="name" className={styles.input} type="text" value={displayName}
              onChange={(e) => setDisplayName(e.target.value)} required autoComplete="name" />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input id="email" className={styles.input} type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Mot de passe (8+ caractères)</label>
            <input id="password" className={styles.input} type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          </div>
          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className={styles.alt}>
          Déjà un compte ? <Link href="/connexion">Connecte-toi</Link>.
        </p>
      </div>
    </div>
  )
}
