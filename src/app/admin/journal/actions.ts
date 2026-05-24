'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'

/** Créer un article (admin uniquement). */
export async function createBlogPost(formData: FormData) {
  await requireAdmin()
  const title = String(formData.get('title') ?? '').trim()
  const excerpt = String(formData.get('excerpt') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()
  const coverUrl = String(formData.get('cover_url') ?? '').trim()
  if (!title || !body) return

  const admin = createAdminClient()
  let slug = slugify(title) || `article-${Date.now().toString(36)}`
  const { data: existing } = await admin.from('blog_posts').select('id').eq('slug', slug).maybeSingle()
  if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`

  await admin.from('blog_posts').insert({
    slug,
    title,
    excerpt: excerpt || null,
    body,
    cover_url: coverUrl || null,
    is_published: true,
  })

  revalidatePath('/journal')
  revalidatePath('/admin/journal')
  redirect('/admin/journal')
}

/** Supprimer un article (admin uniquement). */
export async function deleteBlogPost(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const admin = createAdminClient()
  await admin.from('blog_posts').delete().eq('id', id)
  revalidatePath('/journal')
  revalidatePath('/admin/journal')
}
