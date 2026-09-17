import { useRef, useState } from 'react'
import { RADIO_DISCLAIMER, SPORTS_RADIOS } from '../data/radios'

/**
 * Ouvir no rádio — player HTML5 + escolha de emissoras esportivas.
 */
export default function RadioListen() {
  const streamable = SPORTS_RADIOS.filter((r) => r.kind === 'stream' && r.streamUrl)
  const linkOnly = SPORTS_RADIOS.filter((r) => r.kind === 'link' || !r.streamUrl)
  const [selectedId, setSelectedId] = useState(streamable[0]?.id || null)
  const [streamError, setStreamError] = useState(false)
  const audioRef = useRef(null)

  const selected =
    streamable.find((r) => r.id === selectedId) || streamable[0] || null

  function selectStation(id) {
    setSelectedId(id)
    setStreamError(false)
    const el = audioRef.current
    if (el) {
      el.pause()
      // src change + key remount handles reload; pause for safety
    }
  }

  if (!streamable.length && !linkOnly.length) return null

  return (
    <aside className="radio-listen card" aria-label="Ouvir no rádio">
      <header className="radio-listen__head">
        <h3 className="radio-listen__title">Ouvir no rádio</h3>
        <span className="radio-listen__badge">Ao vivo · HTTPS</span>
      </header>

      <p className="muted tiny radio-listen__disclaimer">{RADIO_DISCLAIMER}</p>

      <div className="radio-listen__stations" role="list">
        {streamable.map((r) => {
          const active = selected?.id === r.id
          return (
            <button
              key={r.id}
              type="button"
              role="listitem"
              className={`radio-listen__chip${active ? ' is-active' : ''}`}
              aria-pressed={active}
              onClick={() => selectStation(r.id)}
            >
              <span className="radio-listen__chip-name">{r.short || r.name}</span>
              {r.city && <span className="radio-listen__chip-city">{r.city}</span>}
            </button>
          )
        })}
        {linkOnly.map((r) => (
          <a
            key={r.id}
            className="radio-listen__chip radio-listen__chip--link"
            href={r.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={r.note || r.name}
          >
            <span className="radio-listen__chip-name">{r.short || r.name}</span>
            <span className="radio-listen__chip-city">site</span>
          </a>
        ))}
      </div>

      {selected?.streamUrl && (
        <div className="radio-listen__player">
          <p className="radio-listen__now">
            <strong>{selected.name}</strong>
            {selected.city ? ` · ${selected.city}` : ''}
          </p>
          <audio
            key={selected.id}
            ref={audioRef}
            className="radio-listen__audio"
            controls
            preload="none"
            playsInline
            src={selected.streamUrl}
            onError={() => setStreamError(true)}
            onPlaying={() => setStreamError(false)}
          >
            Seu navegador não suporta áudio HTML5.
          </audio>
          {streamError && (
            <p className="radio-listen__fallback">
              Stream indisponível agora.{' '}
              <a href={selected.siteUrl} target="_blank" rel="noopener noreferrer">
                Abrir {selected.name} no site
              </a>
            </p>
          )}
          {!streamError && (
            <p className="muted tiny">
              Se o áudio falhar (bloqueio da emissora),{' '}
              <a href={selected.siteUrl} target="_blank" rel="noopener noreferrer">
                abra no site
              </a>
              .
            </p>
          )}
        </div>
      )}
    </aside>
  )
}
