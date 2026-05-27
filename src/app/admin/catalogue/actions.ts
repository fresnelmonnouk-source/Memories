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

function parseFields(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const styleRaw = String(formData.get('style') ?? '')
  const style = STYLES.includes(styleRaw as TattooStyle) ? (styleRaw as TattooStyle) : null
  const sizeLabel = String(formData.get('size_label') ?? '').trim() || null
  const priceRaw = String(formData.get('base_price_eur') ?? '').trim()
  const price = priceRaw ? Number(priceRaw) : null
  const imageUrl = String(formData.get('image_url') ?? '').trim()
  const tagsRaw = String(formData.get('tags') ?? '').trim()
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : []
  const isFeatured = formData.get('is_featured') === 'on'
  const isActive = formData.get('is_active') === 'on'
  return { name, style, sizeLabel, price, imageUrl, tags, isFeatured, isActive }
}

export async function createTattoo(formData: FormData) {
  await requireAdmin()
  const f = parseFields(formData)
  if (!f.name || !f.imageUrl) return
  const admin = createAdminClient()
  let slug = slugify(f.name) || `motif-${Date.now().toString(36)}`
  const { data: existing } = await admin.from('tattoos').select('id').eq('slug', slug).maybeSingle()
  if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`
  await admin.from('tattoos').insert({
    slug, name: f.name, style: f.style, size_label: f.sizeLabel,
    base_price_eur: f.price, image_url: f.imageUrl, tags: f.tags,
    is_featured: f.isFeatured, is_active: f.isActive,
  })
  revalidatePath('/admin/catalogue')
  revalidatePath('/catalogue')
  redirect('/admin/catalogue')
}

export async function updateTattoo(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const f = parseFields(formData)
  if (!f.name || !f.imageUrl) return
  const admin = createAdminClient()
  await admin.from('tattoos').update({
    name: f.name, style: f.style, size_label: f.sizeLabel,
    base_price_eur: f.price, image_url: f.imageUrl, tags: f.tags,
    is_featured: f.isFeatured, is_active: f.isActive,
  }).eq('id', id)
  revalidatePath('/admin/catalogue')
  revalidatePath('/catalogue')
  redirect('/admin/catalogue')
}

export async function deleteTattoo(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const admin = createAdminClient()
  await admin.from('tattoos').delete().eq('id', id)
  revalidatePath('/admin/catalogue')
  revalidatePath('/catalogue')
}

export async function setTattooFlag(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const field = String(formData.get('field') ?? '') // 'is_active' | 'is_featured'
  const value = String(formData.get('value') ?? '') === 'true'
  if (!id || (field !== 'is_active' && field !== 'is_featured')) return
  const admin = createAdminClient()
  const patch = field === 'is_active' ? { is_active: value } : { is_featured: value }
  await admin.from('tattoos').update(patch).eq('id', id)
  revalidatePath('/admin/catalogue')
  revalidatePath('/catalogue')
}
