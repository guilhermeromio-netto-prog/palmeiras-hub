import { useEffect, useState } from 'react'
import { resolveBroadcast } from '../api/sources/broadcast'

/**
 * Bloco "Onde assistir" no card do próximo jogo.
 */
export default function BroadcastInfo({ match }) {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(Boolean(match))

  useEffect(() => {
    if (!match) {
      setInfo(null)
      setLoading(false)
      return
    }
    const ctrl = new AbortController()
    setLoading(true)
    resolveBroadcast(match, ctrl.signal)
      .then((r) => {
        if (!ctrl.signal.aborted) setInfo(r)
      })
      .catch(() => {
        if (!ctrl.signal.aborted) {
          setInfo({
            channels: [],
            confidence: 'unknown',
            note: 'Não foi possível consultar agora.',
            searchUrl: `https://www.google.com/search?q=${encodeURIComponent(`onde assistir Palmeiras ${match.opponent || ''}`)}`,
          })
        }
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false)
      })
    return () => ctrl.abort()
  }, [match?.id, match?.opponent, match?.competition, match?.competitionCode, match?.date])

  if (!match) return null

  const badge =
    info?.confidence === 'press'
      ? 'Confirmado na imprensa'
      : info?.confidence === 'typical'
        ? 'Típico da competição'
        : 'A confirmar'

  return (
    <aside className="broadcast-info card" aria-live="polite">
      <header className="broadcast-info__head">
        <h3 className="broadcast-info__title">Onde assistir</h3>
        <span className={`broadcast-info__badge broadcast-info__badge--${info?.confidence || 'unknown'}`}>
          {loading ? 'Buscando…' : badge}
        </span>
      </header>

      {loading && !info ? (
        <p className="muted tiny">Consultando fontes públicas…</p>
      ) : (
        <>
          {info?.channels?.length > 0 ? (
            <ul className="broadcast-info__channels">
              {info.channels.map((ch) => (
                <li key={ch}>
                  <span className="broadcast-info__ch">{ch}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="broadcast-info__unknown">
              <strong>a confirmar</strong>
            </p>
          )}
          {info?.note && <p className="muted tiny">{info.note}</p>}
          <div className="broadcast-info__links">
            {info?.sourceUrl && (
              <a
                className="broadcast-info__link"
                href={info.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver fonte
              </a>
            )}
            <a
              className="broadcast-info__link"
              href={info?.searchUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buscar “onde assistir”
            </a>
          </div>
        </>
      )}
    </aside>
  )
}
