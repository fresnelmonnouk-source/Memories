'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { fileToBase64, BODY_ZONE_LABELS } from '@/lib/utils'
import type { BodyZone } from '@/types/database'
import styles from './TryonLab.module.css'

interface TattooItem {
  id: string
  slug: string
  name: string
  image_url: string
  thumbnail_url: string | null
  style: string | null
  size_label: string | null
}

interface UploadedImage {
  path: string
  url: string
  previewUrl: string
}

interface TryonResult {
  tryoutId: string
  sessionToken: string
  resultWideUrl: string
  resultCloseUrl: string
}

export function TryonLab({ tattoos }: { tattoos: TattooItem[] }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [wide, setWide] = useState<UploadedImage | null>(null)
  const [close, setClose] = useState<UploadedImage | null>(null)
  const [selectedTattoo, setSelectedTattoo] = useState<TattooItem | null>(null)
  const [customTattooPath, setCustomTattooPath] = useState<string | null>(null)
  const [bodyZone, setBodyZone] = useState<BodyZone>('forearm')
  const [size, setSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL'>('M')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<TryonResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Identifiant de session affiché dans le header du lab.
  // Placeholder côté serveur, valeur aléatoire posée côté client après montage
  // → pas de mismatch d'hydration (Math.random() diffère server/client).
  const [sessionId, setSessionId] = useState('······')
  useEffect(() => {
    setSessionId(Math.random().toString(36).slice(2, 8).toUpperCase())
  }, [])

  // ---------------- Upload handler ----------------
  const uploadFile = useCallback(
    async (file: File, kind: 'body_wide' | 'body_close' | 'custom_tattoo') => {
      const MAX_BYTES = 10 * 1024 * 1024 // 10 Mo — au-delà, Gemini rejette
      if (file.size > MAX_BYTES) {
        throw new Error('Image trop lourde (max 10 Mo). Compresse-la et réessaie.')
      }
      const base64 = await fileToBase64(file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, imageBase64: base64, mimeType: file.type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.reason || data.error || 'Upload échoué')
      return { ...data, previewUrl: URL.createObjectURL(file) } as UploadedImage
    },
    [],
  )

  const handleWideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setError(null)
    try {
      const up = await uploadFile(f, 'body_wide')
      setWide(up)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleCloseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setError(null)
    try {
      const up = await uploadFile(f, 'body_close')
      setClose(up)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleCustomTattooUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setError(null)
    try {
      const up = await uploadFile(f, 'custom_tattoo')
      setCustomTattooPath(up.path)
      setSelectedTattoo({
        id: 'custom',
        slug: 'custom',
        name: 'Mon dessin',
        image_url: up.url,
        thumbnail_url: null,
        style: null,
        size_label: null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  // ---------------- Generate ----------------
  const handleGenerate = async () => {
    if (!wide || !close || !selectedTattoo) return
    setGenerating(true)
    setProgress(0)
    setError(null)

    // Fake progress while generating (Gemini = 15-30s)
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 92))
    }, 600)

    try {
      const res = await fetch('/api/tryout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyWidePath: wide.path,
          bodyClosePath: close.path,
          tattooId: selectedTattoo.id === 'custom' ? undefined : selectedTattoo.id,
          customTattooPath: customTattooPath ?? undefined,
          bodyZone,
          sizeLabel: size,
        }),
      })
      const data = await res.json()
      clearInterval(interval)
      setProgress(100)

      if (!res.ok) {
        setError(data.error || 'Génération échouée')
        return
      }
      setResult(data)
      setStep(3)
    } catch (err) {
      clearInterval(interval)
      setError(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      setGenerating(false)
    }
  }

  const canGoToStep2 = wide && close
  const canGenerate = wide && close && selectedTattoo

  return (
    <div className={styles.lab}>
      {/* Stepper */}
      <div className={styles.stepper}>
        <button
          className={`${styles.step} ${step >= 1 ? styles.active : ''}`}
          onClick={() => setStep(1)}
        >
          <span className={styles.n}>01</span>Ton corps
        </button>
        <button
          className={`${styles.step} ${step >= 2 ? styles.active : ''}`}
          onClick={() => canGoToStep2 && setStep(2)}
          disabled={!canGoToStep2}
        >
          <span className={styles.n}>02</span>Ton encre
        </button>
        <button
          className={`${styles.step} ${step >= 3 ? styles.active : ''}`}
          onClick={() => result && setStep(3)}
          disabled={!result}
        >
          <span className={styles.n}>03</span>Révélation
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          ✕ {error}
        </div>
      )}

      <div className={styles.frame}>
        <div className={styles.frameHeader}>
          <div className={styles.dots}>
            <span /><span /><span />
          </div>
          <span>MEMORIES.LAB · v2.6 · session #{sessionId}</span>
          <span>{generating ? 'GÉNÉRATION...' : step === 3 ? 'TERMINÉ ✓' : 'EN ATTENTE'}</span>
        </div>

        <div className={styles.frameBody}>
          {/* ============ STEP 1: Upload photos ============ */}
          {step === 1 && (
            <div className={styles.uploadGrid}>
              <Dropzone
                label="Plan large"
                hint="Corps entier, lumière neutre"
                badge="PHOTO 01"
                file={wide}
                onChange={handleWideUpload}
                icon="⌒"
              />
              <Dropzone
                label="Gros plan"
                hint="Cadrer la peau nue"
                badge="PHOTO 02"
                file={close}
                onChange={handleCloseUpload}
                icon="◎"
              />
            </div>
          )}

          {/* ============ STEP 2: Choose tattoo + zone + size ============ */}
          {step === 2 && (
            <>
              <div className={styles.configRow}>
                <div className={styles.configBlock}>
                  <label>Zone du corps</label>
                  <select value={bodyZone} onChange={(e) => setBodyZone(e.target.value as BodyZone)}>
                    {(Object.keys(BODY_ZONE_LABELS) as BodyZone[]).map((z) => (
                      <option key={z} value={z}>{BODY_ZONE_LABELS[z]}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.configBlock}>
                  <label>Taille</label>
                  <div className={styles.sizes}>
                    {(['XS','S','M','L','XL'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`${styles.sizeBtn} ${size === s ? styles.sizeActive : ''}`}
                        onClick={() => setSize(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className={styles.catLabel}>
                Catalogue Memories · <strong>{tattoos.length} motifs</strong> · ou téléverse le tien
              </p>

              <div className={styles.tatGrid}>
                {tattoos.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`${styles.tatCard} ${selectedTattoo?.id === t.id ? styles.tatSelected : ''}`}
                    onClick={() => { setSelectedTattoo(t); setCustomTattooPath(null) }}
                  >
                    {t.image_url ? (
                      <img src={t.thumbnail_url ?? t.image_url} alt={t.name} />
                    ) : (
                      <div className={styles.tatPlaceholder}>{t.name.charAt(0)}</div>
                    )}
                    <span className={styles.tatLabel}>{t.name}</span>
                  </button>
                ))}

                <label className={`${styles.tatCard} ${styles.tatUpload}`}>
                  <input type="file" accept="image/*" onChange={handleCustomTattooUpload} hidden />
                  <span className={styles.plus}>+</span>
                  <span className={styles.plusText}>Téléverser<br />mon dessin</span>
                </label>
              </div>
            </>
          )}

          {/* ============ STEP 3: Result ============ */}
          {step === 3 && result && (
            <div className={styles.resultWrap}>
              <div className={styles.resultCard}>
                <div className={styles.resultHead}>
                  <span>Rendu · plan large</span>
                  <span className={styles.resultTag}>4K · généré</span>
                </div>
                <div className={styles.resultCanvas}>
                  <img src={result.resultWideUrl} alt="Rendu plan large" />
                </div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultHead}>
                  <span>Rendu · gros plan</span>
                  <span className={styles.resultTag}>détail · zone</span>
                </div>
                <div className={styles.resultCanvas}>
                  <img src={result.resultCloseUrl} alt="Rendu gros plan" />
                </div>
              </div>
            </div>
          )}

          {/* Progress bar during generation */}
          {generating && (
            <div className={styles.progress}>
              <span>IA · Fusion morphologique en cours</span>
              <div className={styles.bar}>
                <div className={styles.fill} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.pct}>{progress}%</span>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              className={styles.btnGhost}
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
              disabled={step === 1}
            >
              ← Précédent
            </button>

            {step === 1 && (
              <button
                className={styles.btnPrimary}
                onClick={() => setStep(2)}
                disabled={!canGoToStep2}
              >
                Continuer <span>→</span>
              </button>
            )}

            {step === 2 && (
              <button
                className={styles.btnPrimary}
                onClick={handleGenerate}
                disabled={!canGenerate || generating}
              >
                {generating ? 'Génération...' : 'Lancer l\'IA'} <span>→</span>
              </button>
            )}

            {step === 3 && result && (
              <a
                href={`/reservation?tryout=${result.sessionToken}`}
                className={styles.btnPrimary}
              >
                Réserver maintenant <span>→</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// -------------- Dropzone subcomponent --------------
function Dropzone({
  label, hint, badge, file, onChange, icon,
}: {
  label: string
  hint: string
  badge: string
  file: UploadedImage | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon: string
}) {
  return (
    <label className={`${styles.dropzone} ${file ? styles.dropzoneFilled : ''}`}>
      <input type="file" accept="image/*" onChange={onChange} hidden />

      {file ? (
        <>
          <span className={`${styles.badge} ${styles.badgeOk}`}>✓ {badge}</span>
          <img src={file.previewUrl} alt={label} className={styles.preview} />
        </>
      ) : (
        <>
          <span className={styles.badge}>{badge}</span>
          <span className={styles.icon}>{icon}</span>
          <span className={styles.zTitle}>{label}</span>
          <span className={styles.zLabel}>{hint}</span>
          <span className={styles.zHint}>cliquer ou drop · jpg, png · max 10mb</span>
        </>
      )}
    </label>
  )
}
