'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import type { BookingStatus } from '@/types/database'

const STATUSES: BookingStatus[] = ['new', 'contacted', 'confirmed', 'completed', 'cancelled']

export async function updateBookingStatus(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '') as BookingStatus
  if (!id || !STATUSES.includes(status)) return
  const admin = createAdminClient()
  await admin.from('bookings').update({ status }).eq('id', id)
  revalidatePath('/admin/reservations')
}
