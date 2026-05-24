import type { Metadata, Viewport } from 'next'
import { getSiteUrl } from '@/lib/utils'
import { Marquee } from '@/components/ui/Marquee'
import { Nav } from '@/components/ui/Nav'
import { Footer } from '@/components/ui/Footer'
import { Cursor } from '@/components/ui/Cursor'
import { RevealObserver } from '@/components/ui/RevealObserver'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Memories° — Atelier de tatouage · Essaie avant d\'oser',
  description:
    'Studio de tatouage Memories. Essaie virtuellement ton tatouage grâce à notre IA avant même de prendre rendez-vous. Plan large, gros plan, sur ton corps.',
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    title: 'Memories° — L\'encre ne se reprend pas. Le pixel, si.',
    description: 'Essaie ton tatouage en IA avant de prendre rendez-vous.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0807',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Cursor />
        <Marquee />
        <Nav />
        <main>{children}</main>
        <Footer />
        <RevealObserver />
      </body>
    </html>
  )
}
