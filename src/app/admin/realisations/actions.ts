'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'
import type { TattooStyle, BodyZone } from '@/types/database'

const STYLES: TattooStyle[] = ['fine_line', 'blackwork', 'neo_traditional', 'japanese', 'realism', 'geometric', 'minimalist', 'tribal', 'other']
const ZONES: BodyZone[] = ['forearm', 'full_arm', 'shoulder', 'back', 'chest', 'thigh', 'calf', 'ankle', 'ribs', 'neck', 'hand', 'other']

function parseRealisation(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null
  const artistRaw = String(formData.get('artist_id') ?? '').trim()
  const artist_id = artistRaw || null
  const styleRaw = String(formData.get('style') ?? '')
  const style = STYLES.includes(styleRaw as TattooStyle) ? (styleRaw as TattooStyle) : null
  const zoneRaw = String(formData.get('body_zone') ?? '')
  const body_zone = ZONES.includes(zoneRaw as BodyZone) ? (zoneRaw as BodyZone) : null
  const image_url = String(formData.get('image_url') ?? '').trim()
  const orderRaw = String(formData.get('display_order') ?? '').trim()
  const display_order = orderRaw ? Math.round(Number(orderRaw)) : 0
  const is_featured = formData.get('is_featured') === 'on'
  const is_active = formData.get('is_active') === 'on'
  return { title, description, artist_id, style, body_zone, image_url, display_order, is_featured, is_active }
}

export async function createRealisation(formData: FormData) {
  await requireAdmin()
  const r = parseRealisation(formData)
  if (!r.title || !r.image_url) return
  const admin = createAdminClient()
  let slug = slugify(r.title) || `realisation-${Date.now().toString(36)}`
  const { data: existing } = await admin.from('realisations').select('id').eq('slug', slug).maybeSingle()
  if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`
  await admin.from('realisations').insert({
    slug, title: r.title, description: r.description, artist_id: r.artist_id,
    style: r.style, body_zone: r.body_zone, image_url: r.image_url,
    is_featured: r.is_featured, is_active: r.is_active, display_order: r.display_order,
  })
  revalidatePath('/admin/realisations'); revalidatePath('/realisations')
  redirect('/admin/realisations')
}

export async function updateRealisation(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const r = parseRealisation(formData)
  if (!r.title || !r.image_url) return
  const admin = createAdminClient()
  await admin.from('realisations').update({
    title: r.title, description: r.description, artist_id: r.artist_id,
    style: r.style, body_zone: r.body_zone, image_url: r.image_url,
    is_featured: r.is_featured, is_active: r.is_active, display_order: r.display_order,
  }).eq('id', id)
  revalidatePath('/admin/realisations'); revalidatePath('/realisations')
  redirect('/admin/realisations')
}

export async function deleteRealisation(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const admin = createAdminClient()
  await admin.from('realisations').delete().eq('id', id)
  revalidatePath('/admin/realisations'); revalidatePath('/realisations')
}

export async function setRealisationFlag(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const field = String(formData.get('field') ?? '')
  const value = String(formData.get('value') ?? '') === 'true'
  if (!id || (field !== 'is_active' && field !== 'is_featured')) return
  const admin = createAdminClient()
  const patch = field === 'is_active' ? { is_active: value } : { is_featured: value }
  await admin.from('realisations').update(patch).eq('id', id)
  revalidatePath('/admin/realisations'); revalidatePath('/realisations')
}
