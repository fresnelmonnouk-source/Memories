import { createClient as createSbClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * ⚠️ Client admin (service_role) — bypasse RLS.
 * À utiliser UNIQUEMENT dans les API routes / Server Actions.
 * NE JAMAIS importer dans un Client Component.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY missing in env')
  }

  return createSbClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )
}
