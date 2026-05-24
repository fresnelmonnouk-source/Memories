'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './Assistant.module.css'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

const GREETING =
  "Bienvenue à l'atelier. Une question sur un motif, l'essayage IA ou une séance ? Je te guide."

const SUGGESTIONS = [
  'Comment marche l\'essayage ?',
  'Vos tarifs ?',
  'Les soins après ?',
]

export function Assistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const send = useCallback(
    async (text: string) => {
      const content = text.trim()
      if (!content || loading) return
      setError(null)
      const next = [...messages, { role: 'user' as const, content }]
      setMessages(next)
      setInput('')
      setLoading(true)
      try {
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: next.slice(-20) }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'Une erreur est survenue.')
          return
        }
        setMessages([...next, { role: 'assistant', content: data.reply }])
      } catch {
        setError('Connexion impossible. Réessaie.')
      } finally {
        setLoading(false)
      }
    },
    [messages, loading],
  )

  return (
    <>
      <button
        className={styles.fab}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fermer l\'assistant' : 'Ouvrir l\'assistant'}
        aria-expanded={open}
      >
        {open ? '✕' : <><span className={styles.fabDot} /> Aide</>}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Assistant Memories">
          <div className={styles.header}>
            <div className={styles.headTitle}>
              <span className={styles.live} />
              Assistant · <span className={styles.italic}>Memories</span>°
            </div>
            <button className={styles.close} onClick={() => setOpen(false)} aria-label="Fermer">
              ✕
            </button>
          </div>

          <div className={styles.body} ref={scrollRef}>
            <div className={`${styles.msg} ${styles.bot}`}>{GREETING}</div>

            {messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.msg} ${m.role === 'user' ? styles.user : styles.bot}`}
              >
                {m.content}
              </div>
            ))}

            {messages.length === 0 && (
              <div className={styles.suggestions}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} className={styles.chip} onClick={() => send(s)} disabled={loading}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className={`${styles.msg} ${styles.bot} ${styles.typing}`}>
                <span /><span /><span />
              </div>
            )}

            {error && <div className={styles.error}>{error}</div>}
          </div>

          <form
            className={styles.inputRow}
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pose ta question…"
              maxLength={1500}
              disabled={loading}
            />
            <button className={styles.send} type="submit" disabled={loading || !input.trim()} aria-label="Envoyer">
              →
            </button>
          </form>
        </div>
      )}
    </>
  )
}
