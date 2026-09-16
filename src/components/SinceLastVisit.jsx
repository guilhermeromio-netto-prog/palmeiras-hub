import { useEffect, useMemo, useState } from 'react'
import {
  buildVisitSnapshot,
  computeVisitDelta,
  readVisitSnapshot,
  writeVisitSnapshot,
} from '../utils/visitSnapshot'

/** Uma comparação por carregamento da página (SPA). */
let comparedThisLoad = false

export default function SinceLastVisit({ data }) {
  const [delta, setDelta] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!data || comparedThisLoad) return
    comparedThisLoad = true
    const prev = readVisitSnapshot()
    setDelta(computeVisitDelta(data, prev))
    writeVisitSnapshot(buildVisitSnapshot(data))
  }, [data])

  const visitedLabel = useMemo(() => {
    if (!delta?.visitedAt) return null
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(delta.visitedAt))
    } catch {
      return null
    }
  }, [delta])

  if (dismissed || !delta?.items?.length) return null

  return (
    <aside className="since-card card" aria-label="Desde a última vez">
      <header className="since-card__head">
        <div>
          <p className="eyebrow">Desde a última vez</p>
          <h3>O que mudou</h3>
          {visitedLabel && <p className="muted tiny">Última visita: {visitedLabel} (SP)</p>}
        </div>
        <button
          type="button"
          className="btn ghost touch tiny-btn"
          onClick={() => setDismissed(true)}
          aria-label="Dispensar"
        >
          ✕
        </button>
      </header>
      <ul className="since-list">
        {delta.items.map((item, i) => (
          <li key={i} className={`since-item since-item--${item.tone}`}>
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.text}
              </a>
            ) : (
              item.text
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}
