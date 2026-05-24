import { toFile } from 'openai'
import { getOpenAIClient, OPENAI_IMAGE_MODEL } from './client'
import { buildTryoutPrompt } from '@/lib/tryout/prompt'
import type { TryoutInput, TryoutOutput } from '@/lib/tryout/types'

/**
 * Génère un essayage via OpenAI (gpt-image-1, endpoint images.edit).
 * Utilisé UNIQUEMENT en fallback quand Gemini échoue (cf. lib/tryout/generate.ts).
 *
 * ⚠️ OpenAI préserve moins bien l'identité que Nano Banana (cf. FIG-002).
 * Acceptable comme filet de sécurité, pas comme moteur principal.
 */
export async function generateTryoutOpenAI(input: TryoutInput): Promise<TryoutOutput> {
  const t0 = Date.now()
  const client = getOpenAIClient()
  const prompt = buildTryoutPrompt(input)

  const bodyExt   = input.bodyPhotoMime.split('/')[1] ?? 'png'
  const tattooExt = input.tattooImageMime.split('/')[1] ?? 'png'

  // gpt-image-1 accepte plusieurs images d'entrée : photo du corps + motif.
  const [bodyFile, tattooFile] = await Promise.all([
    toFile(Buffer.from(input.bodyPhotoBase64, 'base64'), `body.${bodyExt}`, {
      type: input.bodyPhotoMime,
    }),
    toFile(Buffer.from(input.tattooImageBase64, 'base64'), `tattoo.${tattooExt}`, {
      type: input.tattooImageMime,
    }),
  ])

  const res = await client.images.edit({
    model: OPENAI_IMAGE_MODEL,
    image: [bodyFile, tattooFile],
    prompt,
    size: '1024x1024',
  })

  const b64 = res.data?.[0]?.b64_json
  if (!b64) {
    throw new Error('Aucune image générée par OpenAI')
  }

  return {
    imageBase64: b64,
    mimeType: 'image/png',
    promptUsed: prompt,
    generationMs: Date.now() - t0,
  }
}
