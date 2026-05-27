import { getDeepseekClient, DEEPSEEK_CHAT_MODEL } from '@/lib/deepseek/client'

export interface ModResult {
  decision: 'ok' | 'flag' | 'reject'
  reason?: string
}

/**
 * Modère un message communautaire.
 * - Heuristiques rapides : longueur, liens, majuscules excessives.
 * - Auto-flag IA (DeepSeek) best-effort : si la clé/le service est indispo,
 *   on retombe sur les heuristiques seules (jamais de blocage injuste).
 * Décisions : 'reject' (refusé), 'flag' (stocké mais caché, revue admin), 'ok' (publié).
 */
export async function moderateCommunityText(input: string): Promise<ModResult> {
  const text = input.trim()
  if (text.length < 5) return { decision: 'reject', reason: 'Message trop court.' }

  const urlCount = (text.match(/https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|fr|ink|shop)\b/gi) || []).length
  const letters = text.replace(/[^a-zA-Zà-üÀ-Ü]/g, '')
  const shouty = letters.length > 14 && letters === letters.toUpperCase()
  let heuristicFlag = urlCount > 0 || shouty

  try {
    const completion = await getDeepseekClient().chat.completions.create({
      model: DEEPSEEK_CHAT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            "Tu modères des messages publics d'une communauté autour du tatouage. Réponds STRICTEMENT en JSON : {\"verdict\":\"ok\"|\"flag\"|\"reject\",\"reason\":\"courte raison FR\"}. reject = haine, harcèlement, menaces, contenu sexuel explicite, illégal. flag = spam, publicité, arnaque, contenu douteux. ok = tout le reste (anecdotes, avis, histoires de tatouage).",
        },
        { role: 'user', content: text.slice(0, 1500) },
      ],
      temperature: 0,
      max_tokens: 80,
    })
    const raw = completion.choices[0]?.message?.content ?? ''
    const m = raw.match(/\{[\s\S]*\}/)
    if (m) {
      const parsed = JSON.parse(m[0]) as { verdict?: string; reason?: string }
      if (parsed.verdict === 'reject') return { decision: 'reject', reason: parsed.reason || 'Contenu inapproprié.' }
      if (parsed.verdict === 'flag' || heuristicFlag) return { decision: 'flag', reason: parsed.reason }
      return { decision: 'ok' }
    }
  } catch {
    /* IA indisponible → heuristiques seules */
  }

  return { decision: heuristicFlag ? 'flag' : 'ok' }
}
