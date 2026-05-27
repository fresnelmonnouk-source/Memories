'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'
import type { TattooStyle } from '@/types/database'

const STYLES: TattooStyle[] = [
  'fine_line', 'blackwork', 'neo_traditional', 'japanese',
  'realism', 'geometric', 'minimalist', 'tribal', 'other',
]

function parseArtist(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim() || null
  const yearsRaw = String(formData.get('years_experience') ?? '').trim()
  const years = yearsRaw ? Math.max(0, Math.round(Number(yearsRaw))) : 0
  const primaryRaw = String(formData.get('primary_style') ?? '')
  const primary_style = STYLES.includes(primaryRaw as TattooStyle) ? (primaryRaw as TattooStyle) : null
  const styles = formData.getAll('styles').map(String).filter((s): s is TattooStyle => STYLES.includes(s as TattooStyle))
  const portrait_url = String(formData.get('portrait_url') ?? '').trim() || null
  const instagram = String(formData.get('instagram') ?? '').trim().replace(/^@/, '') || null
  const orderRaw = String(formData.get('display_order') ?? '').trim()
  const display_order = orderRaw ? Math.round(Number(orderRaw)) : 0
  const is_active = formData.get('is_active') === 'on'
  return { name, bio, years, primary_style, styles, portrait_url, instagram, display_order, is_active }
}

export async function createArtist(formData: FormData) {
  await requireAdmin()
  const a = parseArtist(formData)
  if (!a.name) return
  const admin = createAdminClient()
  let slug = slugify(a.name) || `artiste-${Date.now().toString(36)}`
  const { data: existing } = await admin.from('artists').select('id').eq('slug', slug).maybeSingle()
  if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`
  await admin.from('artists').insert({
    slug, name: a.name, bio: a.bio, years_experience: a.years,
    primary_style: a.primary_style, styles: a.styles, portrait_url: a.portrait_url,
    instagram: a.instagram, display_order: a.display_order, is_active: a.is_active,
  })
  revalidatePath('/admin/artistes'); revalidatePath('/a-propos')
  redirect('/admin/artistes')
}

export async function updateArtist(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const a = parseArtist(formData)
  if (!a.name) return
  const admin = createAdminClient()
  await admin.from('artists').update({
    name: a.name, bio: a.bio, years_experience: a.years,
    primary_style: a.primary_style, styles: a.styles, portrait_url: a.portrait_url,
    instagram: a.instagram, display_order: a.display_order, is_active: a.is_active,
  }).eq('id', id)
  revalidatePath('/admin/artistes'); revalidatePath('/a-propos')
  redirect('/admin/artistes')
}

export async function deleteArtist(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const admin = createAdminClient()
  await admin.from('artists').delete().eq('id', id)
  revalidatePath('/admin/artistes'); revalidatePath('/a-propos')
}

export async function setArtistActive(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const value = String(formData.get('value') ?? '') === 'true'
  if (!id) return
  const admin = createAdminClient()
  await admin.from('artists').update({ is_active: value }).eq('id', id)
  revalidatePath('/admin/artistes'); revalidatePath('/a-propos')
}
