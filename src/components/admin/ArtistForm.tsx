import { TATTOO_STYLE_LABELS } from '@/lib/utils'
import type { Artist, TattooStyle } from '@/types/database'
import { ImageUpload } from './ImageUpload'
import styles from './TattooForm.module.css'

const STYLE_KEYS = Object.keys(TATTOO_STYLE_LABELS) as TattooStyle[]

export function ArtistForm({
  action,
  artist,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>
  artist?: Artist
  submitLabel: string
}) {
  const isEdit = !!artist
  return (
    <form action={action} className={styles.form}>
      <h2>{isEdit ? 'Modifier l\'artiste' : 'Nouvel artiste'}</h2>
      {isEdit && <input type="hidden" name="id" value={artist!.id} />}

      <div className={styles.row2}>
        <div>
          <label className={styles.label} htmlFor="name">Nom</label>
          <input id="name" name="name" className={styles.input} required maxLength={120} defaultValue={artist?.name ?? ''} />
        </div>
        <div>
          <label className={styles.label} htmlFor="years_experience">Années d&apos;expérience</label>
          <input id="years_experience" name="years_experience" className={styles.input} type="number" min="0" defaultValue={artist?.years_experience ?? 0} />
        </div>
      </div>

      <div className={styles.row2}>
        <div>
          <label className={styles.label} htmlFor="primary_style">Style principal</label>
          <select id="primary_style" name="primary_style" className={styles.select} defaultValue={artist?.primary_style ?? ''}>
            <option value="">—</option>
            {STYLE_KEYS.map((s) => <option key={s} value={s}>{TATTOO_STYLE_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label className={styles.label} htmlFor="instagram">Instagram (sans @)</label>
          <input id="instagram" name="instagram" className={styles.input} defaultValue={artist?.instagram ?? ''} />
        </div>
      </div>

      <div>
        <label className={styles.label}>Styles pratiqués</label>
        <div className={styles.styleChecks}>
          {STYLE_KEYS.map((s) => (
            <label key={s} className={styles.check}>
              <input type="checkbox" name="styles" value={s} defaultChecked={artist?.styles?.includes(s) ?? false} />
              {TATTOO_STYLE_LABELS[s]}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.row2}>
        <div>
          <label className={styles.label}>Portrait</label>
          <ImageUpload name="portrait_url" kind="artists" defaultUrl={artist?.portrait_url} />
        </div>
        <div>
          <label className={styles.label} htmlFor="display_order">Ordre d&apos;affichage</label>
          <input id="display_order" name="display_order" className={styles.input} type="number" defaultValue={artist?.display_order ?? 0} />
        </div>
      </div>

      <div>
        <label className={styles.label} htmlFor="bio">Bio</label>
        <textarea id="bio" name="bio" className={styles.textarea} defaultValue={artist?.bio ?? ''} />
      </div>

      <div className={styles.checks}>
        <label className={styles.check}>
          <input type="checkbox" name="is_active" defaultChecked={artist ? artist.is_active : true} /> Actif (visible)
        </label>
      </div>

      <button type="submit" className={styles.submit}>{submitLabel}</button>
    </form>
  )
}
