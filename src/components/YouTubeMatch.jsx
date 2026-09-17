import { useEffect, useState } from 'react'
import { resolveYouTube } from '../api/sources/youtube'

/**
 * YouTube do próximo jogo — watch oficial quando achamos; senão busca + canais.
 */
export default function YouTubeMatch({ match }) {
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
    resolveYouTube(match, ctrl.signal)
      .then((r) => {
        if (!ctrl.signal.aborted) setInfo(r)
      })
      .catch(() => {
        if (!ctrl.signal.aborted) {
          const opp = match.opponent || ''
          const q = `Palmeiras ${opp} ao vivo`.trim()
          setInfo({
            searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
            searchQuery: q,
            watchUrl: null,
            channels: [],
            note: 'Não foi possível consultar canais agora.',
            likelyNoLive: false,
            mode: 'search',
          })
        }
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false)
      })
    return () => ctrl.abort()
  }, [match?.id, match?.opponent, match?.competition, match?.competitionCode, match?.date])

  if (!match) return null

  return (
    <aside className="yt-match card" aria-live="polite" aria-label="YouTube">
      <header className="yt-match__head">
        <h3 className="yt-match__title">YouTube</h3>
        <span
          className={`yt-match__badge yt-match__badge--${
            info?.watchUrl ? 'watch' : info?.likelyNoLive ? 'ppv' : 'search'
          }`}
        >
          {loading
            ? 'Buscando…'
            : info?.watchUrl
              ? 'Vídeo encontrado'
              : info?.likelyNoLive
                ? 'Live pode não existir'
                : 'Busca + canais'}
        </span>
      </header>

      {loading && !info ? (
        <p className="muted tiny">Consultando canais públicos…</p>
      ) : (
        <>
          {info?.likelyNoLive && (
            <p className="yt-match__ppv">
              Este confronto tende a ser <strong>Premiere (PPV)</strong> na TV — transmissão
              ao vivo no YouTube muitas vezes <strong>não</strong> está disponível. Rádio e
              busca abaixo ainda ajudam.
            </p>
          )}

          {info?.watchUrl && (
            <div className="yt-match__watch">
              <a
                className="yt-match__watch-btn"
                href={info.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                ▶ Assistir no YouTube
                {info.watchSource ? ` · ${info.watchSource}` : ''}
              </a>
              {info.watchTitle && (
                <p className="muted tiny yt-match__watch-title">{info.watchTitle}</p>
              )}
            </div>
          )}

          <div className="yt-match__links">
            <a
              className="yt-match__link yt-match__link--primary"
              href={info?.searchUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buscar “{info?.searchQuery || 'Palmeiras ao vivo'}”
            </a>
          </div>

          {(info?.channels || []).length > 0 && (
            <ul className="yt-match__channels">
              {info.channels.map((ch) => (
                <li key={ch.id}>
                  <a
                    className="yt-match__ch"
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ch.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {info?.note && <p className="muted tiny">{info.note}</p>}
        </>
      )}
    </aside>
  )
}
