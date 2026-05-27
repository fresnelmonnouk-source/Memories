import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateTryoutWithFallback } from '@/lib/tryout/generate'
import { GEMINI_IMAGE_MODEL } from '@/lib/gemini/client'
import { OPENAI_IMAGE_MODEL } from '@/lib/openai/client'
import { getClientIp, countToday } from '@/lib/utils'
import { z } from 'zod'
import type { BodyZone } from '@/types/database'

export const runtime = 'nodejs'
export const maxDuration = 60 // Gemini peut prendre jusqu'à 30s par image

const tryoutSchema = z.object({
  bodyWidePath:  z.string().min(1),
  bodyClosePath: z.string().min(1),
  tattooId:           z.string().uuid().optional(),
  customTattooPath:   z.string().optional(),
  bodyZone:           z.enum([
    'forearm','full_arm','shoulder','back','chest','thigh',
    'calf','ankle','ribs','neck','hand','other',
  ]).optional(),
  sizeLabel: z.enum(['XS','S','M','L','XL']).optional(),
  email:     z.string().email().optional(),
})

const DAILY_TRYOUT_LIMIT = 10

// Freemium : 1 essai gratuit/appareil (IP) sans compte, puis 2 essais
// gratuits une fois le compte créé, puis abonnement (Stripe — sprint suivant).
const FREE_ANON_TRYOUTS = 1
const FREE_ACCOUNT_TRYOUTS = 2

/**
 * POST /api/tryout
 *
 * Génère un essayage de tatouage en 2 images (plan large + gros plan).
 * Latence : 15-30 secondes.
 * Coût : ~$0.08 par essayage (2 × Nano Banana).
 */
export async function POST(req: NextRequest) {
  const supabase = createAdminClient()
  const ip = getClientIp(req.headers)
  let tryoutId: string | null = null

  try {
    const parsed = tryoutSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const input = parsed.data

    if (!input.tattooId && !input.customTattooPath) {
      return NextResponse.json(
        { error: 'Un tatouage est requis (id ou upload custom)' },
        { status: 400 },
      )
    }

    // ============ Rate limit (par jour, UTC) ============
    const { data: rl } = await supabase
      .from('rate_limits')
      .select('tryout_count, blocked_until, last_seen_at, lifetime_tryout_count')
      .eq('ip_address', ip)
      .maybeSingle()

    const tryoutsToday = countToday(rl?.last_seen_at, rl?.tryout_count)

    if (rl?.blocked_until && new Date(rl.blocked_until) > new Date()) {
      return NextResponse.json({ error: 'Limite atteinte' }, { status: 429 })
    }
    if (tryoutsToday >= DAILY_TRYOUT_LIMIT) {
      return NextResponse.json(
        { error: `Tu as atteint la limite quotidienne de ${DAILY_TRYOUT_LIMIT} essayages.` },
        { status: 429 },
      )
    }

    // ============ Gating freemium ============
    const ssr = await createClient()
    const { data: { user } } = await ssr.auth.getUser()

    let accountUsed = 0
    let subscribed = false
    if (user) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('account_tryouts_used, subscription_status')
        .eq('id', user.id)
        .maybeSingle()
      accountUsed = prof?.account_tryouts_used ?? 0
      subscribed = prof?.subscription_status === 'active'
      if (!subscribed && accountUsed >= FREE_ACCOUNT_TRYOUTS) {
        return NextResponse.json(
          {
            error: 'Tu as utilisé tes essais gratuits. Un abonnement (4 €/mois) arrive très bientôt pour continuer à essayer sans limite.',
            code: 'SUBSCRIPTION_REQUIRED',
          },
          { status: 402 },
        )
      }
    } else {
      const lifetime = rl?.lifetime_tryout_count ?? 0
      if (lifetime >= FREE_ANON_TRYOUTS) {
        return NextResponse.json(
          {
            error: 'Tu as utilisé ton essai gratuit. Crée un compte pour débloquer 2 essais gratuits de plus.',
            code: 'ACCOUNT_REQUIRED',
          },
          { status: 401 },
        )
      }
    }

    // ============ Créer la session tryout ============
    const { data: tryout, error: createErr } = await supabase
      .from('tryouts')
      .insert({
        body_wide_path:    input.bodyWidePath,
        body_close_path:   input.bodyClosePath,
        tattoo_id:         input.tattooId ?? null,
        custom_tattoo_path: input.customTattooPath ?? null,
        body_zone:         (input.bodyZone as BodyZone) ?? null,
        size_label:        input.sizeLabel ?? null,
        email:             input.email ?? null,
        ip_address:        ip,
        status:            'generating',
        model_used:        GEMINI_IMAGE_MODEL,
      })
      .select()
      .single()

    if (createErr || !tryout) {
      console.error('[tryout/create]', createErr)
      return NextResponse.json({ error: 'Création session échouée' }, { status: 500 })
    }
    tryoutId = tryout.id

    // Lien au compte en best-effort (n'échoue pas la génération si la colonne
    // user_id n'existe pas encore — déploiement sûr avant migration freemium.sql).
    if (user) {
      await supabase.from('tryouts').update({ user_id: user.id }).eq('id', tryout.id)
    }

    // Compte la tentative dès maintenant : toute génération lancée est comptée
    // (anti-abus : un échec ne donne pas un nombre illimité de retries gratuits).
    await supabase.rpc('bump_rate_limit', { p_ip: ip, p_kind: 'tryout' })

    // ============ Récupérer les images source ============
    const [wideRes, closeRes, tattooBlob] = await Promise.all([
      downloadFromBucket(supabase, 'uploads', input.bodyWidePath),
      downloadFromBucket(supabase, 'uploads', input.bodyClosePath),
      input.customTattooPath
        ? downloadFromBucket(supabase, 'uploads', input.customTattooPath)
        : downloadTattooFromCatalogue(supabase, input.tattooId!),
    ])

    if (!wideRes || !closeRes || !tattooBlob) {
      await markFailed(supabase, tryout.id, 'Échec de récupération des images sources')
      return NextResponse.json(
        { error: 'Impossible de récupérer les images sources' },
        { status: 500 },
      )
    }

    // ============ Génération IA (parallèle) ============
    const [resultWide, resultClose] = await Promise.all([
      generateTryoutWithFallback({
        bodyPhotoBase64:    wideRes.base64,
        bodyPhotoMime:      wideRes.mime,
        tattooImageBase64:  tattooBlob.base64,
        tattooImageMime:    tattooBlob.mime,
        bodyZone:           (input.bodyZone as BodyZone) ?? null,
        shotType:           'wide',
        sizeLabel:          input.sizeLabel,
      }),
      generateTryoutWithFallback({
        bodyPhotoBase64:    closeRes.base64,
        bodyPhotoMime:      closeRes.mime,
        tattooImageBase64:  tattooBlob.base64,
        tattooImageMime:    tattooBlob.mime,
        bodyZone:           (input.bodyZone as BodyZone) ?? null,
        shotType:           'close',
        sizeLabel:          input.sizeLabel,
      }),
    ])

    // ============ Sauvegarder les rendus dans le bucket privé 'results' ============
    const wideResultPath  = `${tryout.session_token}/result-wide-${Date.now()}.png`
    const closeResultPath = `${tryout.session_token}/result-close-${Date.now()}.png`

    const [upWide, upClose] = await Promise.all([
      supabase.storage.from('results').upload(
        wideResultPath,
        Buffer.from(resultWide.imageBase64, 'base64'),
        { contentType: resultWide.mimeType },
      ),
      supabase.storage.from('results').upload(
        closeResultPath,
        Buffer.from(resultClose.imageBase64, 'base64'),
        { contentType: resultClose.mimeType },
      ),
    ])

    if (upWide.error || upClose.error) {
      console.error('[tryout/upload-results]', upWide.error, upClose.error)
      await markFailed(supabase, tryout.id, 'Échec de sauvegarde des rendus')
      return NextResponse.json({ error: 'Échec de sauvegarde des rendus' }, { status: 500 })
    }

    // Provider(s) réellement utilisé(s) — peut différer entre les 2 rendus si
    // Gemini a basculé sur OpenAI pour l'un seulement.
    const modelUsed = Array.from(new Set([resultWide.provider, resultClose.provider]))
      .map((p) => (p === 'openai' ? OPENAI_IMAGE_MODEL : GEMINI_IMAGE_MODEL))
      .join(' + ')

    // ============ Mettre à jour la session ============
    await supabase
      .from('tryouts')
      .update({
        status: 'done',
        result_wide_path:  wideResultPath,
        result_close_path: closeResultPath,
        generation_ms: resultWide.generationMs + resultClose.generationMs,
        model_used: modelUsed,
        prompt_used: resultWide.promptUsed,
        completed_at: new Date().toISOString(),
      })
      .eq('id', tryout.id)

    // ============ Consommer le quota freemium (succès uniquement) ============
    if (user) {
      if (!subscribed) {
        await supabase
          .from('profiles')
          .update({ account_tryouts_used: accountUsed + 1 })
          .eq('id', user.id)
      }
    } else {
      await supabase.rpc('bump_lifetime_tryout', { p_ip: ip })
    }

    // ============ Signed URLs pour le client ============
    const [signedWide, signedClose] = await Promise.all([
      supabase.storage.from('results').createSignedUrl(wideResultPath, 60 * 60 * 24 * 7),
      supabase.storage.from('results').createSignedUrl(closeResultPath, 60 * 60 * 24 * 7),
    ])

    return NextResponse.json({
      tryoutId: tryout.id,
      sessionToken: tryout.session_token,
      resultWideUrl:  signedWide.data?.signedUrl,
      resultCloseUrl: signedClose.data?.signedUrl,
      generationMs:   resultWide.generationMs + resultClose.generationMs,
    })
  } catch (err) {
    console.error('[tryout]', err)
    if (tryoutId) {
      await markFailed(supabase, tryoutId, err instanceof Error ? err.message : 'Erreur interne')
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 },
    )
  }
}

// ---------- Helpers ----------

async function downloadFromBucket(
  supabase: ReturnType<typeof createAdminClient>,
  bucket: string,
  path: string,
): Promise<{ base64: string; mime: string } | null> {
  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error || !data) return null
  const buf = Buffer.from(await data.arrayBuffer())
  return { base64: buf.toString('base64'), mime: data.type || 'image/jpeg' }
}

async function downloadTattooFromCatalogue(
  supabase: ReturnType<typeof createAdminClient>,
  tattooId: string,
): Promise<{ base64: string; mime: string } | null> {
  const { data: tattoo } = await supabase
    .from('tattoos')
    .select('image_url')
    .eq('id', tattooId)
    .single()

  if (!tattoo?.image_url) return null

  // image_url est dans le bucket public 'tattoos'
  // On extrait le path en retirant le préfixe public/tattoos/
  const path = tattoo.image_url.replace(/^.*\/tattoos\//, '')
  return downloadFromBucket(supabase, 'tattoos', path)
}

async function markFailed(
  supabase: ReturnType<typeof createAdminClient>,
  id: string,
  msg: string,
) {
  await supabase
    .from('tryouts')
    .update({ status: 'failed', error_message: msg })
    .eq('id', id)
}
