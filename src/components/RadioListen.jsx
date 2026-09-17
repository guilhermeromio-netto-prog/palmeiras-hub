import { useCallback, useEffect, useRef, useState } from 'react'
import { RADIO_DISCLAIMER, SPORTS_RADIOS } from '../data/radios'

function stationUrls(radio) {
  if (!radio) return []
  if (Array.isArray(radio.streamUrls) && radio.streamUrls.length) {
    return radio.streamUrls
  }
  return radio.streamUrl ? [radio.streamUrl] : []
}

/**
 * Ouvir no rádio — player custom + escolha de emissoras esportivas.
 * load()+play() rodam dentro do gesto do usuário (obrigatório no mobile).
 */
export default function RadioListen() {
  const streamable = SPORTS_RADIOS.filter(
    (r) => r.kind === 'stream' && stationUrls(r).length > 0,
  )
  const linkOnly = SPORTS_RADIOS.filter(
    (r) => r.kind === 'link' || stationUrls(r).length === 0,
  )
  const [selectedId, setSelectedId] = useState(streamable[0]?.id || null)
  const [urlIndex, setUrlIndex] = useState(0)
  const [streamError, setStreamError] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [busy, setBusy] = useState(false)
  const audioRef = useRef(null)
  const urlIndexRef = useRef(0)
  const urlsRef = useRef([])

  const selected =
    streamable.find((r) => r.id === selectedId) || streamable[0] || null
  const urls = stationUrls(selected)

  useEffect(() => {
    urlIndexRef.current = urlIndex
  }, [urlIndex])

  useEffect(() => {
    urlsRef.current = urls
  }, [urls])

  // Seed first station src without autoplay (no user gesture yet)
  useEffect(() => {
    const el = audioRef.current
    const first = urls[0]
    if (el && first && !el.src) {
      el.src = first
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount / station list identity
  }, [selected?.id])

  const playCurrent = useCallback(() => {
    const el = audioRef.current
    if (!el || (!el.src && !el.getAttribute('src'))) return
    setBusy(true)
    setStreamError(false)
    try {
      el.load()
      const p = el.play()
      if (p && typeof p.then === 'function') {
        p.then(() => {
          setPlaying(true)
          setBusy(false)
        }).catch(() => {
          setPlaying(false)
          setBusy(false)
        })
      } else {
        setPlaying(true)
        setBusy(false)
      }
    } catch {
      setPlaying(false)
      setBusy(false)
    }
  }, [])

  function selectStation(id) {
    const station = streamable.find((r) => r.id === id)
    const nextUrls = stationUrls(station)
    setSelectedId(id)
    setUrlIndex(0)
    urlIndexRef.current = 0
    urlsRef.current = nextUrls
    setStreamError(false)

    const el = audioRef.current
    if (!el || !nextUrls.length) {
      setPlaying(false)
      return
    }

    el.pause()
    el.src = nextUrls[0]
    // load + play must stay inside this click handler (iOS / Android)
    playCurrent()
  }

  function togglePlayPause() {
    const el = audioRef.current
    if (!el) return
    if (playing && !el.paused) {
      el.pause()
      setPlaying(false)
      return
    }
    const list = urlsRef.current
    const idx = urlIndexRef.current
    const src = list[idx] || list[0]
    if (src) el.src = src
    playCurrent()
  }

  function handleAudioError() {
    const el = audioRef.current
    const list = urlsRef.current
    const next = urlIndexRef.current + 1
    if (next < list.length) {
      setUrlIndex(next)
      urlIndexRef.current = next
      setStreamError(false)
      if (el) {
        el.src = list[next]
        el.load()
        const p = el.play()
        if (p && typeof p.then === 'function') {
          p.then(() => setPlaying(true)).catch(() => {
            /* próximo error event ou usuário toca Play */
          })
        }
      }
      return
    }
    setPlaying(false)
    setStreamError(true)
  }

  if (!streamable.length && !linkOnly.length) return null

  return (
    <aside id="home-radio" className="radio-listen card" aria-label="Ouvir no rádio">
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

      {selected && urls.length > 0 && (
        <div className="radio-listen__player">
          <p className="radio-listen__now">
            <strong>{selected.name}</strong>
            {selected.city ? ` · ${selected.city}` : ''}
            {selected.note ? (
              <span className="muted tiny"> — {selected.note}</span>
            ) : null}
          </p>

          <div className="radio-listen__controls">
            <button
              type="button"
              className={`radio-listen__playbtn touch${playing ? ' is-playing' : ''}${busy ? ' is-busy' : ''}`}
              onClick={togglePlayPause}
              aria-pressed={playing}
              disabled={busy && !playing}
            >
              <span className="radio-listen__play-orb" aria-hidden="true">
                {playing ? (
                  <span className="radio-listen__pause-icon" />
                ) : (
                  <span className="radio-listen__play-icon" />
                )}
              </span>
              <span className="radio-listen__play-copy">
                <span className="radio-listen__play-label">
                  {busy && !playing ? 'Conectando…' : playing ? 'Pausar' : 'Ouvir agora'}
                </span>
                {playing && (
                  <span className="radio-listen__eq" aria-hidden="true">
                    <i /><i /><i /><i />
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* Hidden native element — custom UI drives the same Audio API */}
          <audio
            ref={audioRef}
            className="radio-listen__audio sr-only"
            preload="none"
            playsInline
            onError={handleAudioError}
            onPlaying={() => {
              setStreamError(false)
              setPlaying(true)
              setBusy(false)
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
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
