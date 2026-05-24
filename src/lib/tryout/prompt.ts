import type { BodyZone } from '@/types/database'

const BODY_ZONE_FR: Record<BodyZone, string> = {
  forearm:   'avant-bras',
  full_arm:  'bras complet',
  shoulder:  'épaule',
  back:      'dos',
  chest:     'poitrine',
  thigh:     'cuisse',
  calf:      'mollet',
  ankle:     'cheville',
  ribs:      'côtes',
  neck:      'cou',
  hand:      'main',
  other:     'la zone indiquée',
}

const SIZE_HINT: Record<string, string> = {
  XS: 'very small (2-3 cm)',
  S:  'small (4-6 cm)',
  M:  'medium (8-12 cm)',
  L:  'large (15-20 cm)',
  XL: 'very large (25+ cm)',
}

/**
 * Construit le prompt de génération, partagé par les providers Gemini et OpenAI
 * pour garantir un résultat cohérent quel que soit le moteur utilisé.
 * Insiste (CAPS) sur la préservation de l'identité — point faible connu d'OpenAI.
 */
export function buildTryoutPrompt(input: {
  bodyZone: BodyZone | null
  shotType: 'wide' | 'close'
  sizeLabel?: string | null
}): string {
  const zoneFr = input.bodyZone ? BODY_ZONE_FR[input.bodyZone] : 'la zone visible la plus appropriée'
  const sizeHint = input.sizeLabel ? SIZE_HINT[input.sizeLabel] ?? '' : ''
  const shotInstr =
    input.shotType === 'wide'
      ? 'wide shot showing the full body / a large portion of the person'
      : 'close-up shot focused on the skin area where the tattoo will be applied'

  return `You are a professional tattoo previsualization assistant. Your edit must be SURGICAL: add the tattoo and nothing else.

TASK: Apply the tattoo design from the SECOND image onto the ${zoneFr} of the person in the FIRST image.

INPUTS:
- Image 1 (${shotInstr}): the photo of the person. This photo MUST stay IDENTICAL except for the added tattoo. Treat every pixel outside the tattoo zone as locked.
- Image 2: the tattoo design to apply. This is a flat artwork; ignore its background, transfer only the design.

HOW TO RENDER THE TATTOO:
1. Place the tattoo on the ${zoneFr} ONLY. Never put ink on any other part of the body.
${sizeHint ? `2. Size: ${sizeHint}.` : ''}
3. CONFORM THE TATTOO TO THE BODY — it is ink ON living skin, NOT a flat sticker pasted on top:
   - Bend, curve and wrap the design around the three-dimensional shape of the ${zoneFr} (cylindrical limbs, rounded muscles, bone structure). Any line crossing a curved surface MUST visibly follow that curvature.
   - Apply correct perspective and foreshortening: the parts of the design facing away from the camera appear compressed, narrower, and partially hidden by the body's own volume.
   - Let skin folds, creases, wrinkles, joints, knuckles and tendons locally distort, break, stretch or compress the design where they cross it — exactly as a real tattoo deforms when the skin bends and moves.
   - Make the ink follow the skin's micro-relief and texture (pores, fine lines, hair): it must sit INTO the surface, never float above it.
   - Slightly vary the ink's apparent opacity, sharpness and edge softness with the skin's stretch and the local lighting, so no portion of the design ever looks like a flat decal or a printed overlay.
4. Match the exact lighting direction, shadows and skin tone of the original photo so the ink truly sits on the skin.
5. Render a FRESHLY-MADE tattoo (just finished, minutes old): the ink is crisp, deep and slightly glossy/wet-looking, and the skin immediately around the design shows realistic mild redness and irritation — the natural "just tattooed" reaction. Keep this redness subtle, localized and believable: NO cartoonish red, NO bleeding, NO heavy swelling, NO redness spreading far from the lines.
6. The final image must look fully natural and photorealistic, as if shot with the same camera on real skin.

PRESERVE EVERYTHING ELSE EXACTLY — this is the most important rule:
- Do NOT change the face, identity, hair, body proportions, pose, hands or expression.
- Do NOT alter the clothing, background, framing, colors or global lighting.
- Do NOT retouch, smooth, beautify, sharpen or recolor the skin anywhere outside the tattoo zone.
- Edit ONLY the target zone (the tattoo + its immediate fresh-skin reaction). Everything else stays pixel-for-pixel identical to the original.

OUTPUT: only the edited photo — no text, no watermark, no border, no extra elements.`
}
