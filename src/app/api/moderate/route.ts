import { NextRequest, NextResponse } from 'next/server'
import { moderateBodyPhoto } from '@/lib/gemini/moderate'
import { z } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 20

const schema = z.object({
  imageBase64: z.string().min(100),
  mimeType: z.string().regex(/^image\//),
})

/**
 * POST /api/moderate
 * Endpoint isolé de modération (utilisé pour preview avant upload).
 */
export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }
    const result = await moderateBodyPhoto(parsed.data.imageBase64, parsed.data.mimeType)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[moderate]', err)
    return NextResponse.json({ error: 'Erreur de modération' }, { status: 500 })
  }
}
