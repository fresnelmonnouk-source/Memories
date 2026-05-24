import { generateTryout } from '@/lib/gemini/tryout'
import { generateTryoutOpenAI } from '@/lib/openai/tryout'
import { hasOpenAI } from '@/lib/openai/client'
import type { TryoutInput, TryoutOutput, TryoutProvider } from './types'

export type TryoutResult = TryoutOutput & { provider: TryoutProvider }

/**
 * Génère un essayage avec Gemini (Nano Banana) en moteur principal,
 * et bascule sur OpenAI UNIQUEMENT si Gemini échoue (erreur, SAFETY, quota)
 * ET qu'une clé OpenAI est configurée. Respecte FIG-002 (Gemini prioritaire).
 *
 * Si les deux échouent, on relance l'erreur Gemini d'origine (plus pertinente).
 */
export async function generateTryoutWithFallback(input: TryoutInput): Promise<TryoutResult> {
  try {
    const r = await generateTryout(input)
    return { ...r, provider: 'gemini' }
  } catch (geminiErr) {
    if (!hasOpenAI()) throw geminiErr

    console.warn(
      '[tryout] Gemini a échoué → bascule OpenAI :',
      geminiErr instanceof Error ? geminiErr.message : geminiErr,
    )

    try {
      const r = await generateTryoutOpenAI(input)
      return { ...r, provider: 'openai' }
    } catch (openaiErr) {
      console.error('[tryout] OpenAI a aussi échoué :', openaiErr)
      throw geminiErr
    }
  }
}
