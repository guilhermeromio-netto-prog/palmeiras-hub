import { useCallback, useEffect, useState } from 'react'
import {
  markEntryGateSeen,
  prefersReducedMotion,
  shouldShowEntryGate,
} from '../utils/entryGate'

const BASE = import.meta.env.BASE_URL
const CREST = `${BASE}palmeiras-crest.svg`
const HERO = `${BASE}brand/hero-campeao.png`

const AUTO_MS = 2500

/**
 * Portal cinematográfico — 1× por dia (SP). Não bloqueia navegações depois.
 */
export default function EntryGate() {
  const [open, setOpen] = useState(() => shouldShowEntryGate())
  const [leaving, setLeaving] = useState(false)

  const dismiss = useCallback(() => {
    if (leaving) return
    setLeaving(true)
    markEntryGateSeen()
    const delay = prefersReducedMotion() ? 0 : 320
    window.setTimeout(() => setOpen(false), delay)
  }, [leaving])

  useEffect(() => {
    if (!open) return undefined
    const ms = prefersReducedMotion() ? 400 : AUTO_MS
    const t = window.setTimeout(dismiss, ms)
    return () => window.clearTimeout(t)
  }, [open, dismiss])

  if (!open) return null

  return (
    <div
      className={`entry-gate${leaving ? ' entry-gate--out' : ''}${prefersReducedMotion() ? ' entry-gate--static' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Bem-vindo ao Palmeiras Hub"
      onClick={dismiss}
    >
      <img className="entry-gate__bg" src={HERO} alt="" decoding="async" />
      <div className="entry-gate__veil" aria-hidden="true" />
      <div className="entry-gate__content">
        <img
          className="entry-gate__crest"
          src={CREST}
          width={96}
          height={96}
          alt=""
          decoding="async"
        />
        <p className="entry-gate__eyebrow">Palmeiras Hub</p>
        <h1 className="entry-gate__title">Avanti</h1>
        <p className="entry-gate__lede">O Maior Campeão · sala VERDAO</p>
        <button
          type="button"
          className="btn primary touch entry-gate__cta"
          onClick={(e) => {
            e.stopPropagation()
            dismiss()
          }}
        >
          Entrar no Hub
        </button>
        <button
          type="button"
          className="entry-gate__skip"
          onClick={(e) => {
            e.stopPropagation()
            dismiss()
          }}
        >
          Pular
        </button>
      </div>
    </div>
  )
}
