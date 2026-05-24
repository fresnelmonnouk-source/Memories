import OpenAI from 'openai'

let _client: OpenAI | null = null

/**
 * Client DeepSeek paresseux. DeepSeek expose une API compatible OpenAI,
 * donc on réutilise le SDK `openai` en changeant simplement la baseURL.
 * Instancié au 1er usage (pas au chargement du module) pour ne pas casser
 * `next build` quand la clé n'est pas en env.
 */
export function getDeepseekClient(): OpenAI {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY missing in env')
  }
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com',
    })
  }
  return _client
}

export const DEEPSEEK_CHAT_MODEL = process.env.DEEPSEEK_CHAT_MODEL ?? 'deepseek-chat'
