import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Nettoyage RGPD des essayages expirés (> 30 jours).
 *
 * Supprime À LA FOIS les fichiers Storage (photos clients + rendus) ET les
 * lignes DB — la fonction SQL `cleanup_expired_tryouts()` ne supprimait que
 * les lignes, laissant les fichiers orphelins indéfiniment.
 *
 * À appeler 1×/jour via Vercel Cron (cf. vercel.json) ou un GitHub Action.
 * Protégé par CRON_SECRET (header `Authorization: Bearer <secret>`).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET non configuré' }, { status: 500 })
  }
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const nowIso = new Date().toISOString()

  // 1. Récupérer les essayages expirés + leurs fichiers
  const { data: expired, error } = await supabase
    .from('tryouts')
    .select('id, body_wide_path, body_close_path, custom_tattoo_path, result_wide_path, result_close_path')
    .lt('expires_at', nowIso)

  if (error) {
    console.error('[cleanup]', error)
    return NextResponse.json({ error: 'Lecture échouée' }, { status: 500 })
  }
  if (!expired || expired.length === 0) {
    return NextResponse.json({ deleted: 0, message: 'Rien à nettoyer' })
  }

  // 2. Regrouper les paths par bucket (en filtrant les null)
  const uploadPaths = expired.flatMap((t) =>
    [t.body_wide_path, t.body_close_path, t.custom_tattoo_path].filter(
      (p): p is string => !!p,
    ),
  )
  const resultPaths = expired.flatMap((t) =>
    [t.result_wide_path, t.result_close_path].filter((p): p is string => !!p),
  )

  // 3. Supprimer les fichiers Storage (les erreurs sont loguées sans bloquer)
  if (uploadPaths.length) {
    const { error: e } = await supabase.storage.from('uploads').remove(uploadPaths)
    if (e) console.error('[cleanup/uploads]', e)
  }
  if (resultPaths.length) {
    const { error: e } = await supabase.storage.from('results').remove(resultPaths)
    if (e) console.error('[cleanup/results]', e)
  }

  // 4. Supprimer les lignes DB
  const ids = expired.map((t) => t.id)
  const { error: delErr } = await supabase.from('tryouts').delete().in('id', ids)
  if (delErr) {
    console.error('[cleanup/delete]', delErr)
    return NextResponse.json({ error: 'Suppression DB échouée' }, { status: 500 })
  }

  return NextResponse.json({
    deleted: ids.length,
    filesRemoved: uploadPaths.length + resultPaths.length,
  })
}
