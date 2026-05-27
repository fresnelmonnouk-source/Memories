'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { blockByKey } from '@/lib/content'

export async function saveContent(formData: FormData) {
  await requireAdmin()
  const key = String(formData.get('key') ?? '')
  const body = String(formData.get('body') ?? '')
  const block = blockByKey(key)
  if (!block || !body.trim()) return

  const admin = createAdminClient()
  await admin.from('site_content').upsert({ key, title: block.label, body }, { onConflict: 'key' })

  revalidatePath('/admin/contenu')
  revalidatePath('/a-propos')
}
