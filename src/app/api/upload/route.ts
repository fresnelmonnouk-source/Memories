import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { moderateBodyPhoto } from '@/lib/gemini/moderate'
import { getClientIp, countToday } from '@/lib/utils'
import { z } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 30

const uploadSchema = z.object({
  kind: z.enum(['body_wide', 'body_close', 'custom_tattoo']),
  imageBase64: z.string().min(100),
  mimeType: z.string().regex(/^image\//),
  sessionToken: z.string().optional(),
})

/**
 * POST /api/upload
 * Upload une image dans le bucket privé 'uploads',
 * la modère via Gemini, et retourne le path pour utilisation ultérieure.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = uploadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const { kind, imageBase64, mimeType, sessionToken } = parsed.data

    const supabase = createAdminClient()
    const ip = getClientIp(req.headers)

    // ============ Rate limit (par jour, UTC) ============
    const { data: rl } = await supabase
      .from('rate_limits')
      .select('upload_count, blocked_until, last_seen_at')
      .eq('ip_address', ip)
      .maybeSingle()

    const uploadsToday = countToday(rl?.last_seen_at, rl?.upload_count)

    if (rl?.blocked_until && new Date(rl.blocked_until) > new Date()) {
      return NextResponse.json(
        { error: 'Limite atteinte. Réessaie plus tard.' },
        { status: 429 },
      )
    }
    if (uploadsToday >= 50) {
      return NextResponse.json(
        { error: 'Trop d\'uploads aujourd\'hui.' },
        { status: 429 },
      )
    }

    // ============ Modération (sauf pour les designs de tatouage) ============
    if (kind === 'body_wide' || kind === 'body_close') {
      const moderation = await moderateBodyPhoto(imageBase64, mimeType)
      if (!moderation.passed) {
        // Compte la tentative : une modération consomme un appel Gemini.
        await supabase.rpc('bump_rate_limit', { p_ip: ip, p_kind: 'upload' })
        return NextResponse.json(
          {
            error: 'Image refusée',
            reason: moderation.reason,
            details: moderation.details,
          },
          { status: 422 },
        )
      }
    }

    // ============ Upload Supabase Storage ============
    const ext = mimeType.split('/')[1] ?? 'jpg'
    const filename = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const path = sessionToken ? `${sessionToken}/${filename}` : `tmp/${filename}`

    const buffer = Buffer.from(imageBase64, 'base64')
    const { error: uploadErr } = await supabase.storage
      .from('uploads')
      .upload(path, buffer, { contentType: mimeType, upsert: false })

    if (uploadErr) {
      console.error('[upload]', uploadErr)
      return NextResponse.json({ error: 'Upload échoué' }, { status: 500 })
    }

    // ============ Bump rate limit ============
    await supabase.rpc('bump_rate_limit', { p_ip: ip, p_kind: 'upload' })

    // ============ Retourne path + signed URL pour preview ============
    const { data: signed } = await supabase.storage
      .from('uploads')
      .createSignedUrl(path, 60 * 60 * 24) // 24h

    return NextResponse.json({
      path,
      url: signed?.signedUrl,
    })
  } catch (err) {
    console.error('[upload]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
