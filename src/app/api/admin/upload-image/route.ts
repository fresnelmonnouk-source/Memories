import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth'

export const runtime = 'nodejs'

const schema = z.object({
  kind: z.enum(['catalogue', 'artists', 'realisations']),
  imageBase64: z.string().min(1),
  mimeType: z.string().min(1),
})

// Buckets PUBLICS existants — pas de nouveau bucket à créer.
const TARGET: Record<string, { bucket: string; prefix: string }> = {
  catalogue:    { bucket: 'tattoos',      prefix: '' },
  artists:      { bucket: 'tattoos',      prefix: 'artists/' },
  realisations: { bucket: 'realisations', prefix: '' },
}

const EXT: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/webp': 'webp',
}

/** Upload d'image depuis le back office (admin uniquement). */
export async function POST(req: NextRequest) {
  const profile = await getProfile()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
  const { kind, imageBase64, mimeType } = parsed.data

  const ext = EXT[mimeType]
  if (!ext) {
    return NextResponse.json({ error: 'Format non supporté (png, jpg, webp).' }, { status: 400 })
  }

  const buf = Buffer.from(imageBase64, 'base64')
  if (buf.byteLength > 4 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image trop lourde (max 4 Mo). Compresse-la et réessaie.' }, { status: 400 })
  }

  const { bucket, prefix } = TARGET[kind]
  const path = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const admin = createAdminClient()
  const { error } = await admin.storage.from(bucket).upload(path, buf, {
    contentType: mimeType,
    upsert: false,
  })
  if (error) {
    console.error('[admin/upload-image]', error)
    return NextResponse.json({ error: 'Upload échoué.' }, { status: 500 })
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
