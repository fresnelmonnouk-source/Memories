import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDeepseekClient, DEEPSEEK_CHAT_MODEL } from '@/lib/deepseek/client'
import { getClientIp } from '@/lib/utils'
import { buildAssistantSystemPrompt } from '@/lib/assistant/prompt'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 30

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(1500),
      }),
    )
    .min(1)
    .max(20),
})

// Rate-limit léger EN MÉMOIRE (par instance serverless). Garde anti-abus
// suffisante pour la v1 ; durcissement prod = colonne `message_count` dans
// la table `rate_limits` (migration), comme pour upload/tryout. TODO.
const WINDOW_MS = 24 * 60 * 60 * 1000
const DAILY_LIMIT = 40
const hits = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const cur = hits.get(ip)
  if (!cur || now > cur.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  cur.count += 1
  return cur.count > DAILY_LIMIT
}

/**
 * POST /api/assistant
 * Assistant conseiller pour les visiteurs. Clé Gemini server-only.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Tu as atteint la limite de messages pour aujourd'hui. Reviens un peu plus tard, ou écris directement à l'atelier." },
        { status: 429 },
      )
    }

    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
    }
    const { messages } = parsed.data

    // Contexte « vivant » : noms des artistes actifs. Best-effort, ne bloque jamais.
    let artists: string[] = []
    try {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from('artists')
        .select('name')
        .eq('is_active', true)
        .order('display_order')
      artists = (data ?? []).map((a) => a.name)
    } catch {
      /* contexte optionnel — on continue sans */
    }

    const completion = await getDeepseekClient().chat.completions.create({
      model: DEEPSEEK_CHAT_MODEL,
      messages: [
        { role: 'system', content: buildAssistantSystemPrompt({ artists }) },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.6,
      max_tokens: 700,
    })

    const reply = completion.choices[0]?.message?.content?.trim()
    if (!reply) {
      return NextResponse.json(
        { error: "Je n'ai pas réussi à répondre. Reformule ou réessaie." },
        { status: 502 },
      )
    }

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[assistant]', err)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Réessaie dans un instant.' },
      { status: 500 },
    )
  }
}
