'use client'

import { useState } from 'react'
import { fileToBase64 } from '@/lib/utils'
import styles from './ImageUpload.module.css'

/**
 * Champ image admin : upload direct vers le bucket public (via /api/admin/upload-image)
 * et stocke l'URL résultante dans un input caché `name` (soumis avec le formulaire).
 */
export function ImageUpload({
  name,
  kind,
  defaultUrl,
}: {
  name: string
  kind: 'catalogue' | 'artists' | 'realisations'
  defaultUrl?: string | null
}) {
  const [url, setUrl] = useState(defaultUrl ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setErr(null)
    if (file.size > 4 * 1024 * 1024) {
      setErr('Image trop lourde (max 4 Mo).')
      return
    }
    setBusy(true)
    try {
      const imageBase64 = await fileToBase64(file)
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, imageBase64, mimeType: file.type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload échoué')
      setUrl(data.url)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <input type="hidden" name={name} value={url} />
      {url && <img src={url} alt="" className={styles.preview} />}
      <label className={styles.picker}>
        <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onPick} disabled={busy} />
        {busy ? 'Envoi…' : url ? 'Remplacer l\'image' : 'Choisir une image'}
      </label>
      {url && <button type="button" className={styles.clear} onClick={() => setUrl('')}>Retirer</button>}
      <span className={styles.hint}>png, jpg ou webp · max 4 Mo</span>
      {err && <span className={styles.err}>{err}</span>}
    </div>
  )
}
