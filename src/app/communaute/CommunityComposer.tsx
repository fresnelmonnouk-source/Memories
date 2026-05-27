'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addCommunityPost, type PostState } from './actions'
import styles from './page.module.css'

export function CommunityComposer() {
  const [state, formAction, pending] = useActionState<PostState, FormData>(addCommunityPost, {})
  const ref = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) ref.current?.reset()
  }, [state])

  return (
    <form ref={ref} action={formAction} className={styles.composer}>
      <textarea name="body" placeholder="Raconte l'histoire de ton tatouage…" maxLength={2000} required />
      <div className={styles.composerFoot}>
        <span className={styles.hint}>Public · modéré · 2000 caractères max</span>
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? 'Envoi…' : 'Publier'}
        </button>
      </div>
      {state.error && <p className={styles.modError}>{state.error}</p>}
      {state.ok && <p className={styles.modOk}>{state.message}</p>}
    </form>
  )
}
