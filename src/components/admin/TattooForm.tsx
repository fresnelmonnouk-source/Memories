import { TATTOO_STYLE_LABELS } from '@/lib/utils'
import type { Tattoo, TattooStyle } from '@/types/database'
import styles from './TattooForm.module.css'

const STYLE_KEYS = Object.keys(TATTOO_STYLE_LABELS) as TattooStyle[]
const SIZES = ['XS', 'S', 'M', 'L', 'XL']

/**
 * Formulaire de motif partagé (création + édition).
 * `action` = server action ; `tattoo` fourni en mode édition (préremplissage).
 */
export function TattooForm({
  action,
  tattoo,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>
  tattoo?: Tattoo
  submitLabel: string
}) {
  const isEdit = !!tattoo
  return (
    <form action={action} className={styles.form}>
      <h2>{isEdit ? 'Modifier le motif' : 'Nouveau motif'}</h2>
      {isEdit && <input type="hidden" name="id" value={tattoo!.id} />}

      <div>
        <label className={styles.label} htmlFor="name">Nom</label>
        <input id="name" name="name" className={styles.input} required maxLength={120} defaultValue={tattoo?.name ?? ''} />
      </div>

      <div className={styles.row2}>
        <div>
          <label className={styles.label} htmlFor="style">Style</label>
          <select id="style" name="style" className={styles.select} defaultValue={tattoo?.style ?? ''}>
            <option value="">—</option>
            {STYLE_KEYS.map((s) => <option key={s} value={s}>{TATTOO_STYLE_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label className={styles.label} htmlFor="size_label">Taille</label>
          <select id="size_label" name="size_label" className={styles.select} defaultValue={tattoo?.size_label ?? ''}>
            <option value="">—</option>
            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.row2}>
        <div>
          <label className={styles.label} htmlFor="base_price_eur">Prix (€)</label>
          <input id="base_price_eur" name="base_price_eur" className={styles.input} type="number" min="0" step="1" defaultValue={tattoo?.base_price_eur ?? ''} />
        </div>
        <div>
          <label className={styles.label} htmlFor="tags">Tags (séparés par virgule)</label>
          <input id="tags" name="tags" className={styles.input} defaultValue={tattoo?.tags?.join(', ') ?? ''} />
        </div>
      </div>

      <div>
        <label className={styles.label} htmlFor="image_url">URL de l&apos;image</label>
        <input id="image_url" name="image_url" className={styles.input} type="url" required placeholder="https://…/tattoos/mon-motif.png" defaultValue={tattoo?.image_url ?? ''} />
      </div>

      <div className={styles.checks}>
        <label className={styles.check}>
          <input type="checkbox" name="is_active" defaultChecked={tattoo ? tattoo.is_active : true} /> Actif (visible au catalogue)
        </label>
        <label className={styles.check}>
          <input type="checkbox" name="is_featured" defaultChecked={tattoo ? tattoo.is_featured : false} /> Mis en avant
        </label>
      </div>

      <button type="submit" className={styles.submit}>{submitLabel}</button>
    </form>
  )
}
