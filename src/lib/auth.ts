import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

/** Utilisateur Supabase courant (ou null). */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** Profil applicatif courant (ou null). Lecture via RLS « propre profil ». */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  return data ?? null
}

/** Exige une session ; sinon redirige vers /connexion. */
export async function requireUser() {
  const user = await getUser()
  if (!user) redirect('/connexion')
  return user
}

/** Exige le rôle admin ; sinon redirige (connexion ou accueil). */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile) redirect('/connexion?next=/admin')
  if (profile.role !== 'admin') redirect('/')
  return profile
}
