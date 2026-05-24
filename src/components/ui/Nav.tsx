'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import styles from './Nav.module.css'

const LINKS = [
  { href: '/',              label: 'Accueil',      num: '00' },
  { href: '/essayage',      label: 'Essayage',     num: '01' },
  { href: '/catalogue',     label: 'Catalogue',    num: '02' },
  { href: '/realisations',  label: 'Réalisations', num: '03' },
  { href: '/artistes',      label: 'Artistes',     num: '04' },
  { href: '/a-propos',      label: 'À propos',     num: '05' },
] as const

export function Nav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          Memories<sup>°</sup>
        </Link>

        <ul className={styles.links}>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} data-num={l.num}>{l.label}</Link>
            </li>
          ))}
        </ul>

        <div className={styles.right}>
          <Link href="/reservation" className={styles.cta}>
            <span className={styles.dot}></span>Réserver
          </Link>
          <button
            className={styles.burger}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span data-open={open}></span>
            <span data-open={open}></span>
          </button>
        </div>
      </nav>

      {/* Menu mobile fullscreen */}
      <div className={styles.mobile} data-open={open}>
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)}>
                <span className={styles.mNum}>{l.num}</span>
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/reservation" onClick={() => setOpen(false)} className={styles.mCta}>
              <span className={styles.mNum}>★</span>
              Réserver
            </Link>
          </li>
        </ul>
      </div>
    </>
  )
}
