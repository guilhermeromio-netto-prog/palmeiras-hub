import { useEffect, useMemo, useState } from 'react'
import {
  buildVisitSnapshot,
  computeVisitDelta,
  readVisitSnapshot,
  writeVisitSnapshot,
} from '../utils/visitSnapshot'

/** Uma comparação por carregamento da página (SPA). */
let comparedThisLoad = false

function isBigNews(items) {
  if (!items?.length) return false
  return items.some(
    (it) =>
      it.type === 'result' ||
      it.type === 'position' ||
      (it.type === 'news' && it.tone !== 'quiet')
  )
}

function headlineFor(items) {
  const result = items.find((i) => i.type === 'result')
  if (result) return 'Tem resultado novo!'
  const pos = items.find((i) => i.type === 'position')
  if (pos) return pos.tone === 'up' ? 'Subiu na tabela!' : 'Movimentação na tabela'
  const news = items.find((i) => i.type === 'news')
  if (news) return 'Manchete quente'
  return 'Enquanto você saiu'
}

/**
 * “Enquanto você saiu” — card dramático só quando há novidade relevante.
 * Sem novidade: fica quieto (não renderiza).
 */
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

  const dramatic = isBigNews(delta.items)
  // Quiet/minimal: only news without result/table → still show but lighter
  const head = headlineFor(delta.items)
  const primary = delta.items[0]

  return (
    <aside
      className={`since-card card${dramatic ? ' since-card--drama' : ' since-card--quiet'}`}
      aria-label="Enquanto você saiu"
    >
      <header className="since-card__head">
        <div>
          <p className="eyebrow">
            {dramatic ? 'Enquanto você saiu' : 'Atualização'}
          </p>
          <h3>{head}</h3>
          {visitedLabel && (
            <p className="muted tiny">Última visita: {visitedLabel} (SP)</p>
          )}
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

      {dramatic && primary && (
        <p className={`since-card__spotlight since-item--${primary.tone}`}>
          {primary.url ? (
            <a href={primary.url} target="_blank" rel="noopener noreferrer">
              {primary.text}
            </a>
          ) : (
            primary.text
          )}
        </p>
      )}

      <ul className="since-list">
        {delta.items.map((item, i) => {
          if (dramatic && i === 0) return null
          return (
            <li key={i} className={`since-item since-item--${item.tone}`}>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.text}
                </a>
              ) : (
                item.text
              )}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
