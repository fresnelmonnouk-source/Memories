'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './CookieBanner.module.css'

const KEY = 'memories_cookie_consent'

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {
      /* localStorage indisponible — on n'affiche pas */
    }
  }, [])

  function accept() {
    try {
      localStorage.setItem(KEY, 'accepted')
    } catch { /* ignore */ }
    setShow(false)
  }

  if (!show) return null

  return (
    <div className={styles.banner} role="dialog" aria-label="Cookies" aria-live="polite">
      <p className={styles.text}>
        Ce site utilise uniquement des cookies <strong>essentiels</strong> (ta session de
        connexion). Aucun pistage publicitaire.{' '}
        <Link href="/legal/confidentialite" className={styles.link}>En savoir plus</Link>.
      </p>
      <button type="button" className={styles.btn} onClick={accept}>J&apos;ai compris</button>
    </div>
  )
}
