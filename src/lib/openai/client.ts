import OpenAI from 'openai'

let _client: OpenAI | null = null

/** Client OpenAI paresseux (instancié au 1er usage, pas au chargement du module). */
export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY missing in env')
  }
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}

export const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1'

/** Le fallback OpenAI n'est tenté que si une clé est configurée. */
export function hasOpenAI(): boolean {
  return !!process.env.OPENAI_API_KEY
}
