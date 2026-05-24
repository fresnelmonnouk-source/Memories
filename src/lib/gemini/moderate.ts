import { geminiClient, GEMINI_MODERATION_MODEL } from './client'

export interface ModerationResult {
  passed: boolean
  reason: string | null
  details: {
    is_human_body: boolean
    is_minor: boolean
    is_explicit_nudity: boolean
    appears_consensual: boolean
  }
}

/**
 * Vérifie qu'une image uploadée est appropriée pour l'essayage :
 *  - photo de corps humain
 *  - pas d'enfant mineur
 *  - pas de nudité explicite
 *  - apparence consensuelle (selfie probable)
 *
 * Coût : ~$0.0001 par appel (Gemini Flash, texte uniquement)
 */
export async function moderateBodyPhoto(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
): Promise<ModerationResult> {
  const prompt = `Tu es un modérateur de contenu pour un studio de tatouage en ligne.
Analyse l'image fournie et réponds STRICTEMENT en JSON valide avec ce schéma :

{
  "is_human_body": boolean,         // photo d'un corps humain visible
  "is_minor": boolean,              // la personne semble avoir moins de 18 ans
  "is_explicit_nudity": boolean,    // nudité explicite (parties génitales, etc.)
  "appears_consensual": boolean,    // ressemble à un selfie ou photo prise volontairement
  "reason_if_rejected": string|null // raison concise en français si problème
}

Critères d'acceptation : photo d'adulte, peau visible mais habillé(e) ou en sous-vêtements
acceptables, pas de mineur, pas de pornographie. Une photo de plage ou de salle de bain
est OK si elle ne contient pas de nudité explicite.

Réponds UNIQUEMENT le JSON, rien d'autre.`

  try {
    const response = await geminiClient.models.generateContent({
      model: GEMINI_MODERATION_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
    })

    const text = response.text ?? ''
    // Extraire le JSON même si Gemini ajoute des backticks
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        passed: false,
        reason: 'Modération impossible (réponse invalide)',
        details: {
          is_human_body: false,
          is_minor: false,
          is_explicit_nudity: false,
          appears_consensual: false,
        },
      }
    }

    const parsed = JSON.parse(jsonMatch[0])
    const passed =
      parsed.is_human_body === true &&
      parsed.is_minor === false &&
      parsed.is_explicit_nudity === false &&
      parsed.appears_consensual === true

    return {
      passed,
      reason: passed ? null : (parsed.reason_if_rejected ?? 'Image refusée'),
      details: {
        is_human_body: !!parsed.is_human_body,
        is_minor: !!parsed.is_minor,
        is_explicit_nudity: !!parsed.is_explicit_nudity,
        appears_consensual: !!parsed.appears_consensual,
      },
    }
  } catch (err) {
    console.error('[moderate]', err)
    return {
      passed: false,
      reason: 'Erreur de modération',
      details: {
        is_human_body: false,
        is_minor: false,
        is_explicit_nudity: false,
        appears_consensual: false,
      },
    }
  }
}
