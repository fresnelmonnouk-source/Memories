import { geminiClient, GEMINI_IMAGE_MODEL } from './client'
import { buildTryoutPrompt } from '@/lib/tryout/prompt'
import type { TryoutInput, TryoutOutput } from '@/lib/tryout/types'

export type { TryoutInput, TryoutOutput } from '@/lib/tryout/types'

/**
 * Génère un essayage de tatouage via Nano Banana (Gemini 2.5 Flash Image).
 *
 * Coût : ~$0.039 par image générée.
 * Latence typique : 8-15 secondes par image.
 */
export async function generateTryout(input: TryoutInput): Promise<TryoutOutput> {
  const t0 = Date.now()
  const prompt = buildTryoutPrompt(input)

  const response = await geminiClient.models.generateContent({
    model: GEMINI_IMAGE_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: input.bodyPhotoMime,   data: input.bodyPhotoBase64 } },
          { inlineData: { mimeType: input.tattooImageMime, data: input.tattooImageBase64 } },
        ],
      },
    ],
  })

  // Extraire l'image générée des parts de la réponse
  const parts = response.candidates?.[0]?.content?.parts ?? []
  const imagePart = parts.find((p) => p.inlineData?.data)

  if (!imagePart?.inlineData?.data) {
    throw new Error('Aucune image générée par Gemini')
  }

  return {
    imageBase64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType ?? 'image/png',
    promptUsed: prompt,
    generationMs: Date.now() - t0,
  }
}
