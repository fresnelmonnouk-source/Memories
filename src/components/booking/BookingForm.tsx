'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BODY_ZONE_LABELS } from '@/lib/utils'
import type { BodyZone, TattooStyle } from '@/types/database'
import styles from './BookingForm.module.css'

interface Artist {
  id: string
  name: string
  slug: string
  primary_style: TattooStyle | null
}

export function BookingForm({
  artists,
  preselectedArtistId,
  tryoutId,
}: {
  artists: Artist[]
  preselectedArtistId?: string
  tryoutId?: string
}) {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredArtistId: preselectedArtistId ?? '',
    bodyZone: '' as BodyZone | '',
    projectDescription: '',
    photoConsent: false,
  })

  const update = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          preferredArtistId: form.preferredArtistId || null,
          bodyZone: form.bodyZone || null,
          tryoutId: tryoutId || null,
          photoConsent: form.photoConsent,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Échec de la réservation')
        return
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>✓</div>
        <h2>C&apos;est noté.</h2>
        <p>
          On t&apos;a envoyé un email de confirmation. L&apos;atelier te recontacte
          sous <strong>24h ouvrées</strong> pour caler la consultation.
        </p>
        <Link href="/" className={styles.successCta}>← Retour à l&apos;accueil</Link>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {tryoutId && (
        <div className={styles.tryoutBadge}>
          ✓ Cette réservation inclut ton essayage IA récent
        </div>
      )}

      {error && <div className={styles.error}>✕ {error}</div>}

      <div className={styles.grid2}>
        <Field label="Prénom" required>
          <input
            type="text"
            required
            value={form.firstName}
            onChange={(e) => update('firstName', e.target.value)}
          />
        </Field>
        <Field label="Nom" required>
          <input
            type="text"
            required
            value={form.lastName}
            onChange={(e) => update('lastName', e.target.value)}
          />
        </Field>
      </div>

      <div className={styles.grid2}>
        <Field label="Email" required>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>
        <Field label="Téléphone (optionnel)">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+228 ..."
          />
        </Field>
      </div>

      <Field label="Artiste préféré (optionnel)">
        <select
          value={form.preferredArtistId}
          onChange={(e) => update('preferredArtistId', e.target.value)}
        >
          <option value="">Pas de préférence — orientez-moi</option>
          {artists.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}{a.primary_style ? ` · ${a.primary_style}` : ''}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Zone du corps">
        <select
          value={form.bodyZone}
          onChange={(e) => update('bodyZone', e.target.value as BodyZone | '')}
        >
          <option value="">Choisir une zone</option>
          {(Object.keys(BODY_ZONE_LABELS) as BodyZone[]).map((z) => (
            <option key={z} value={z}>{BODY_ZONE_LABELS[z]}</option>
          ))}
        </select>
      </Field>

      <Field label="Décris ton projet">
        <textarea
          rows={5}
          value={form.projectDescription}
          onChange={(e) => update('projectDescription', e.target.value)}
          placeholder="Style envisagé, taille approximative, références, contraintes (allergies, peau sensible)..."
        />
      </Field>

      {tryoutId && (
        <label className={styles.consent}>
          <input
            type="checkbox"
            checked={form.photoConsent}
            onChange={(e) => update('photoConsent', e.target.checked)}
          />
          <span>
            J&apos;autorise l&apos;envoi de <strong>ma photo originale</strong> et du
            {' '}<strong>rendu généré</strong> à l&apos;atelier Memories pour préparer ma
            séance. Sans ça, l&apos;atelier ne reçoit que le lien de l&apos;essayage.
          </span>
        </label>
      )}

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
        <span>→</span>
      </button>

      <p className={styles.legal}>
        En envoyant ce formulaire tu acceptes que nous te contactions par email
        et téléphone. Tes données ne sont jamais cédées à des tiers.
      </p>
    </form>
  )
}

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        {label} {required && <em>*</em>}
      </span>
      {children}
    </label>
  )
}
