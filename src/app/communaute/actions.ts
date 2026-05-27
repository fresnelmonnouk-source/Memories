'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth'
import { moderateCommunityText } from '@/lib/community/moderate'

export interface PostState {
  ok?: boolean
  message?: string
  error?: string
}

const MIN_INTERVAL_MS = 60_000 // 1 message / minute
const DAILY_MAX = 15

/** Publier un post (useActionState) : rate-limit + modération auto. */
export async function addCommunityPost(_prev: PostState, formData: FormData): Promise<PostState> {
  const body = String(formData.get('body') ?? '').trim()
  if (!body) return { error: 'Écris quelque chose avant de publier.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Connecte-toi pour publier.' }

  const admin = createAdminClient()

  // ---- Anti-spam : fréquence ----
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  const { data: recent } = await admin
    .from('community_posts')
    .select('created_at')
    .eq('author_id', user.id)
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (recent && recent.length >= DAILY_MAX) {
    return { error: 'Tu as atteint la limite de messages pour aujourd\'hui. Reviens demain.' }
  }
  if (recent && recent[0] && Date.now() - new Date(recent[0].created_at).getTime() < MIN_INTERVAL_MS) {
    return { error: 'Doucement — attends une minute entre deux messages.' }
  }

  // ---- Modération ----
  const mod = await moderateCommunityText(body)
  if (mod.decision === 'reject') {
    return { error: mod.reason || 'Ton message a été refusé par la modération.' }
  }

  const profile = await getProfile()
  const name = profile?.display_name || user.email?.split('@')[0] || 'Anonyme'
  const status = mod.decision === 'flag' ? 'flagged' : 'approved'

  await admin.from('community_posts').insert({
    author_id: user.id,
    author_name: name,
    body: body.slice(0, 2000),
    status,
  })
  revalidatePath('/communaute')

  return status === 'flagged'
    ? { ok: true, message: 'Merci ! Ton message passe en validation par l\'atelier avant publication.' }
    : { ok: true, message: 'Publié — merci pour ton histoire !' }
}

/** Approuver un post signalé (admin). */
export async function approveCommunityPost(formData: FormData) {
  const profile = await getProfile()
  if (profile?.role !== 'admin') return
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await createAdminClient().from('community_posts').update({ status: 'approved' }).eq('id', id)
  revalidatePath('/communaute')
}

/** Supprimer un post (admin). */
export async function deleteCommunityPost(formData: FormData) {
  const profile = await getProfile()
  if (profile?.role !== 'admin') return
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await createAdminClient().from('community_posts').delete().eq('id', id)
  revalidatePath('/communaute')
}
