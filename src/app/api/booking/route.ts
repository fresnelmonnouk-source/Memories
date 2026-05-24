import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendBookingEmails } from '@/lib/resend'
import { getClientIp, BODY_ZONE_LABELS, getSiteUrl } from '@/lib/utils'
import { z } from 'zod'
import type { BodyZone } from '@/types/database'

export const runtime = 'nodejs'

const bookingSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName:  z.string().min(1).max(80),
  email:     z.string().email(),
  phone:     z.string().max(40).optional(),
  preferredArtistId: z.string().uuid().optional().nullable(),
  bodyZone:  z.enum([
    'forearm','full_arm','shoulder','back','chest','thigh',
    'calf','ankle','ribs','neck','hand','other',
  ]).optional().nullable(),
  projectDescription: z.string().max(2000).optional(),
  tryoutId: z.string().uuid().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const parsed = bookingSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const data = parsed.data

    const supabase = createAdminClient()
    const ip = getClientIp(req.headers)

    // ============ Créer la réservation ============
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        first_name: data.firstName,
        last_name:  data.lastName,
        email:      data.email,
        phone:      data.phone ?? null,
        preferred_artist_id: data.preferredArtistId ?? null,
        body_zone:  (data.bodyZone as BodyZone) ?? null,
        project_description: data.projectDescription ?? null,
        tryout_id:  data.tryoutId ?? null,
      })
      .select()
      .single()

    if (error || !booking) {
      console.error('[booking]', error)
      return NextResponse.json({ error: 'Création réservation échouée' }, { status: 500 })
    }

    // ============ Récupérer le nom de l'artiste si choisi ============
    let artistName: string | undefined
    if (data.preferredArtistId) {
      const { data: artist } = await supabase
        .from('artists')
        .select('name')
        .eq('id', data.preferredArtistId)
        .single()
      artistName = artist?.name
    }

    // ============ Lien essayage IA ============
    let tryoutLink: string | undefined
    if (data.tryoutId) {
      const { data: tryout } = await supabase
        .from('tryouts')
        .select('session_token')
        .eq('id', data.tryoutId)
        .single()
      if (tryout) {
        tryoutLink = `${getSiteUrl()}/essayage/${tryout.session_token}`
      }
    }

    // ============ Envoyer emails ============
    await sendBookingEmails({
      firstName: data.firstName,
      lastName:  data.lastName,
      email:     data.email,
      phone:     data.phone,
      artistName,
      bodyZone:  data.bodyZone ? BODY_ZONE_LABELS[data.bodyZone as BodyZone] : undefined,
      projectDescription: data.projectDescription,
      tryoutLink,
      bookingId: booking.id,
    })

    return NextResponse.json({
      id: booking.id,
      confirmationToken: booking.confirmation_token,
    })
  } catch (err) {
    console.error('[booking]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
