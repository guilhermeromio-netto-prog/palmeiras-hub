import { useCallback, useEffect, useMemo, useState } from 'react'
import { resolveBroadcast } from '../api/sources/broadcast'
import { formatDate, formatDateTime, matchTitle, scoreLine } from '../utils/format'
import {
  nextMatchShareText,
  resultShareText,
} from '../utils/share'
import {
  downloadBlob,
  renderStoriesCard,
  shareStoriesBlob,
} from '../utils/storiesCard'
import { msUntil } from '../utils/datetime'

const BASE = import.meta.env.BASE_URL
const CREST = `${BASE}palmeiras-crest.svg`

/**
 * Cartão Stories 9:16 — Baixar PNG + Compartilhar.
 * Próximo jogo se houver futuro; senão último resultado.
 */
export default function StoriesCard({ nextMatch, lastResult }) {
  const pick = useMemo(() => {
    if (nextMatch?.date) {
      const ms = msUntil(nextMatch.date)
      // Still show as "next" if kickoff not long past
      if (ms == null || ms > -3 * 60 * 60 * 1000) {
        return { mode: 'next', match: nextMatch }
      }
    }
    if (lastResult) return { mode: 'result', match: lastResult }
    if (nextMatch) return { mode: 'next', match: nextMatch }
    return null
  }, [nextMatch, lastResult])

  const [channels, setChannels] = useState([])
  const [busy, setBusy] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!pick?.match || pick.mode !== 'next') {
      setChannels([])
      return undefined
    }
    const ctrl = new AbortController()
    resolveBroadcast(pick.match, ctrl.signal)
      .then((r) => {
        if (!ctrl.signal.aborted) setChannels(r?.channels || [])
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setChannels([])
      })
    return () => ctrl.abort()
  }, [pick?.match?.id, pick?.match?.opponent, pick?.mode, pick?.match?.date])

  const shareText = useMemo(() => {
    if (!pick?.match) return ''
    if (pick.mode === 'result') {
      return resultShareText(pick.match, { formatDate, matchTitle, scoreLine })
    }
    return nextMatchShareText(pick.match, { formatDateTime, matchTitle })
  }, [pick])

  const buildBlob = useCallback(async () => {
    if (!pick?.match) return null
    const crestAbs =
      typeof window !== 'undefined'
        ? new URL(CREST, window.location.href).href
        : CREST
    return renderStoriesCard({
      mode: pick.mode,
      match: pick.match,
      kickoffLabel: formatDateTime(pick.match.date),
      scoreLabel: scoreLine(pick.match) || '',
      channels: pick.mode === 'next' ? channels : [],
      crestUrl: crestAbs,
    })
  }, [pick, channels])

  // Lightweight preview (regenerate when inputs change)
  useEffect(() => {
    let cancelled = false
    let objectUrl = null
    ;(async () => {
      if (!pick?.match) {
        setPreviewUrl(null)
        return
      }
      try {
        const blob = await buildBlob()
        if (cancelled || !blob) return
        objectUrl = URL.createObjectURL(blob)
        setPreviewUrl(objectUrl)
      } catch {
        if (!cancelled) setPreviewUrl(null)
      }
    })()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [buildBlob, pick])

  if (!pick?.match) return null

  async function onDownload() {
    if (busy) return
    setBusy(true)
    setStatus('')
    try {
      const blob = await buildBlob()
      if (!blob) {
        setStatus('Não deu pra gerar agora')
        return
      }
      downloadBlob(blob, 'palmeiras-hub-stories.png')
      setStatus('PNG baixado ✓')
    } finally {
      setBusy(false)
    }
  }

  async function onShare() {
    if (busy) return
    setBusy(true)
    setStatus('')
    try {
      const blob = await buildBlob()
      if (!blob) {
        setStatus('Não deu pra gerar agora')
        return
      }
      const result = await shareStoriesBlob(blob, shareText)
      if (result === 'aborted') setStatus('')
      else if (result === 'native') setStatus('Compartilhado ✓')
      else setStatus('Pronto pra Stories / WhatsApp ✓')
    } finally {
      setBusy(false)
    }
  }

  const title =
    pick.mode === 'result' ? 'Cartão do resultado' : 'Cartão do próximo jogo'

  return (
    <aside className="stories-card card" aria-label="Cartão Stories">
      <header className="stories-card__head">
        <div>
          <p className="eyebrow">Stories</p>
          <h3>{title}</h3>
          <p className="muted tiny">
            Arte 9:16 · {matchTitle(pick.match)} · use no WhatsApp / Instagram
          </p>
        </div>
      </header>

      {previewUrl && (
        <div className="stories-card__preview-wrap">
          <img
            className="stories-card__preview"
            src={previewUrl}
            alt="Prévia do cartão Stories"
            width={180}
            height={320}
            decoding="async"
          />
        </div>
      )}

      <div className="stories-card__actions">
        <button
          type="button"
          className="btn primary touch"
          onClick={onDownload}
          disabled={busy}
        >
          {busy ? 'Gerando…' : 'Baixar PNG'}
        </button>
        <button
          type="button"
          className="btn share-btn touch"
          onClick={onShare}
          disabled={busy}
        >
          <span aria-hidden="true">📲</span> Compartilhar
        </button>
      </div>
      {status && (
        <p className="muted tiny stories-card__status" aria-live="polite">
          {status}
        </p>
      )}
    </aside>
  )
}
