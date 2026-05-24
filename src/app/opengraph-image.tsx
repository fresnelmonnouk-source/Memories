import { ImageResponse } from 'next/og'

// Image Open Graph par défaut (héritée par toutes les routes via metadataBase).
// Police par défaut de next/og pour ne dépendre d'aucun fetch au build ;
// le rendu en Instrument Serif sera un polish Phase 2.
export const alt = 'Memories° — Atelier de tatouage à Lomé. Essaie ton tatouage en IA avant de te décider.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0807',
          color: '#f0ebe3',
          padding: '72px',
          borderTop: '16px solid #d62828',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 6,
            color: '#6b6660',
          }}
        >
          ATELIER DE TATOUAGE · LOMÉ — TOGO
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 184, fontStyle: 'italic', lineHeight: 1, letterSpacing: -4 }}>
            Memories
          </span>
          <span style={{ fontSize: 72, color: '#d62828', marginLeft: 8 }}>°</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 46, fontStyle: 'italic' }}>
            {"L'encre ne se reprend pas. Le pixel, si."}
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: '#6b6660', marginTop: 16 }}>
            {'Essaie ton tatouage en IA avant de prendre rendez-vous.'}
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
