'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function saveLegal(formData: FormData) {
  await requireAdmin()
  const key = String(formData.get('key') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()
  if (!key.startsWith('legal_') || !title || !body) return

  const admin = createAdminClient()
  await admin.from('site_content').upsert({ key, title, body }, { onConflict: 'key' })

  revalidatePath('/admin/legal')
  revalidatePath('/legal/mentions-legales')
  revalidatePath('/legal/confidentialite')
  revalidatePath('/legal/cgv')
}
