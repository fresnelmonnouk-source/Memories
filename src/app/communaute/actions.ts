'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth'

/** Publier un post communautaire (tout utilisateur connecté). */
export async function addCommunityPost(formData: FormData) {
  const body = String(formData.get('body') ?? '').trim()
  if (!body) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return // non connecté → ignoré (l'UI propose la connexion)

  const profile = await getProfile()
  const name = profile?.display_name || user.email?.split('@')[0] || 'Anonyme'

  const admin = createAdminClient()
  await admin.from('community_posts').insert({
    author_id: user.id,
    author_name: name,
    body: body.slice(0, 2000),
  })
  revalidatePath('/communaute')
}

/** Supprimer un post (admin uniquement). */
export async function deleteCommunityPost(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return

  const profile = await getProfile()
  if (profile?.role !== 'admin') return // garde-fou serveur

  const admin = createAdminClient()
  await admin.from('community_posts').delete().eq('id', id)
  revalidatePath('/communaute')
}
