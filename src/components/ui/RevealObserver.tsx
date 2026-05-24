'use client'

import { useEffect } from 'react'

/**
 * Active les animations [data-reveal] au scroll.
 * Monté une seule fois dans le layout.
 */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 },
    )

    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))

    // Re-observe sur changement de route
    const mo = new MutationObserver(() => {
      document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => io.observe(el))
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  return null
}
