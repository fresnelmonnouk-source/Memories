import { TATTOO_STYLE_LABELS, BODY_ZONE_LABELS } from '@/lib/utils'
import type { Realisation, TattooStyle, BodyZone } from '@/types/database'
import styles from './TattooForm.module.css'

const STYLE_KEYS = Object.keys(TATTOO_STYLE_LABELS) as TattooStyle[]
const ZONE_KEYS = Object.keys(BODY_ZONE_LABELS) as BodyZone[]

export function RealisationForm({
  action,
  realisation,
  artists,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>
  realisation?: Realisation
  artists: { id: string; name: string }[]
  submitLabel: string
}) {
  const isEdit = !!realisation
  return (
    <form action={action} className={styles.form}>
      <h2>{isEdit ? 'Modifier la réalisation' : 'Nouvelle réalisation'}</h2>
      {isEdit && <input type="hidden" name="id" value={realisation!.id} />}

      <div>
        <label className={styles.label} htmlFor="title">Titre</label>
        <input id="title" name="title" className={styles.input} required maxLength={160} defaultValue={realisation?.title ?? ''} />
      </div>

      <div className={styles.row2}>
        <div>
          <label className={styles.label} htmlFor="artist_id">Artiste</label>
          <select id="artist_id" name="artist_id" className={styles.select} defaultValue={realisation?.artist_id ?? ''}>
            <option value="">—</option>
            {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className={styles.label} htmlFor="display_order">Ordre d&apos;affichage</label>
          <input id="display_order" name="display_order" className={styles.input} type="number" defaultValue={realisation?.display_order ?? 0} />
        </div>
      </div>

      <div className={styles.row2}>
        <div>
          <label className={styles.label} htmlFor="style">Style</label>
          <select id="style" name="style" className={styles.select} defaultValue={realisation?.style ?? ''}>
            <option value="">—</option>
            {STYLE_KEYS.map((s) => <option key={s} value={s}>{TATTOO_STYLE_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label className={styles.label} htmlFor="body_zone">Zone du corps</label>
          <select id="body_zone" name="body_zone" className={styles.select} defaultValue={realisation?.body_zone ?? ''}>
            <option value="">—</option>
            {ZONE_KEYS.map((z) => <option key={z} value={z}>{BODY_ZONE_LABELS[z]}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={styles.label} htmlFor="image_url">URL de l&apos;image</label>
        <input id="image_url" name="image_url" className={styles.input} type="url" required placeholder="https://…" defaultValue={realisation?.image_url ?? ''} />
      </div>

      <div>
        <label className={styles.label} htmlFor="description">Description</label>
        <textarea id="description" name="description" className={styles.textarea} defaultValue={realisation?.description ?? ''} />
      </div>

      <div className={styles.checks}>
        <label className={styles.check}>
          <input type="checkbox" name="is_active" defaultChecked={realisation ? realisation.is_active : true} /> Actif (visible)
        </label>
        <label className={styles.check}>
          <input type="checkbox" name="is_featured" defaultChecked={realisation ? realisation.is_featured : false} /> Mis en avant
        </label>
      </div>

      <button type="submit" className={styles.submit}>{submitLabel}</button>
    </form>
  )
}
