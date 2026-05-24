'use client'

// global-error remplace le root layout : il doit rendre son propre <html>/<body>.
// On importe les variables globales ; les polices retombent sur Georgia/system-ui
// (le <link> Google Fonts du layout est court-circuité ici). Styles inline pour
// rester totalement auto-suffisant même si tout le reste a échoué.
import { useEffect } from 'react'
import '@/styles/globals.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="fr">
      <body
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '40px 24px',
          textAlign: 'center',
          background: 'var(--bg)',
          color: 'var(--ink)',
        }}
      >
        <div style={{ display: 'grid', gap: 24, justifyItems: 'center', maxWidth: 540 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--blood)',
            }}
          >
            Erreur critique
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(34px, 7vw, 64px)',
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
            }}
          >
            L&apos;atelier est momentanément fermé.
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.65, opacity: 0.8, maxWidth: 420 }}>
            Une erreur inattendue est survenue. Recharge la page — si ça persiste,
            reviens un peu plus tard.
          </p>

          {error.digest && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--mute)',
              }}
            >
              réf · {error.digest}
            </span>
          )}

          <button
            onClick={reset}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              padding: '15px 26px',
              borderRadius: 999,
              cursor: 'pointer',
              background: 'var(--blood)',
              color: 'var(--ink)',
              border: '1px solid var(--blood)',
            }}
          >
            Recharger
          </button>
        </div>
      </body>
    </html>
  )
}
