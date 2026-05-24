import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  // Redirection RELATIVE à la requête réelle (bon host/port) — surtout pas
  // une URL absolue construite depuis NEXT_PUBLIC_APP_URL (port différent en local).
  return NextResponse.redirect(new URL('/', req.url), { status: 303 })
}
