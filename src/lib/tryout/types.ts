import type { BodyZone } from '@/types/database'

export interface TryoutInput {
  bodyPhotoBase64: string
  bodyPhotoMime: string
  tattooImageBase64: string
  tattooImageMime: string
  bodyZone: BodyZone | null
  shotType: 'wide' | 'close'
  sizeLabel?: string | null
}

export type TryoutProvider = 'gemini' | 'openai'

export interface TryoutOutput {
  imageBase64: string
  mimeType: string
  promptUsed: string
  generationMs: number
}
