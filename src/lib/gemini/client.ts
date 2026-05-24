import { GoogleGenAI } from '@google/genai'

let _client: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY missing in env')
  }
  if (!_client) {
    _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  }
  return _client
}

/**
 * Proxy paresseux : le client n'est instancié (et la clé n'est vérifiée)
 * qu'au PREMIER accès à une propriété, pas au chargement du module.
 * Évite que `next build` casse en phase « collect page data » quand la clé
 * n'est pas en env (cf. Gotcha #1 du handoff — ne pas instancier en top-level).
 */
export const geminiClient = new Proxy({} as GoogleGenAI, {
  get(_target, prop, receiver) {
    const client = getClient()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export const GEMINI_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image'

export const GEMINI_MODERATION_MODEL =
  process.env.GEMINI_MODERATION_MODEL ?? 'gemini-2.5-flash'
