import { useCallback, useEffect, useState } from 'react'
import { fetchMatchWeather } from '../api/sources/weather.js'

function formatKickLocal(atLocal) {
  if (!atLocal) return null
  // atLocal = "2026-09-20T16:00" in America/Sao_Paulo
  try {
    const d = new Date(`${atLocal}:00-03:00`)
    if (Number.isNaN(d.getTime())) return null
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return null
  }
}

export default function MatchWeather({ match }) {
  const venue = match?.venue
  const date = match?.date
  const isHome = !!match?.isHome
  const key = `${venue || ''}|${date || ''}|${isHome ? 1 : 0}`

  const [state, setState] = useState({ status: 'loading', data: null })
  const [retryTick, setRetryTick] = useState(0)

  const load = useCallback(
    (signal) => {
      setState({ status: 'loading', data: null })
      fetchMatchWeather({ venue, date, isHome, signal })
        .then((data) => {
          if (signal?.aborted) return
          setState({ status: data.ok ? 'ok' : 'empty', data })
        })
        .catch((err) => {
          if (signal?.aborted) return
          setState({
            status: 'empty',
            data: {
              ok: false,
              city: 'a confirmar',
              error: err.message || 'Falha ao buscar clima',
            },
          })
        })
    },
    [venue, date, isHome]
  )

  useEffect(() => {
    const ctrl = new AbortController()
    load(ctrl.signal)
    return () => ctrl.abort()
  }, [load, key, retryTick])

  const onRetry = () => setRetryTick((n) => n + 1)

  const city = state.data?.city || 'a confirmar'
  const w = state.data?.weather
  const when = formatKickLocal(w?.atLocal)

  return (
    <div className="match-weather" aria-live="polite">
      <div className="match-weather__head">
        <span className="match-weather__title">Clima previsto</span>
        <span className="match-weather__city">{city}</span>
      </div>

      {state.status === 'loading' && (
        <p className="match-weather__muted">Carregando previsão…</p>
      )}

      {state.status === 'ok' && w && (
        <div className="match-weather__body">
          <span className="match-weather__icon" aria-hidden="true">
            {w.icon}
          </span>
          <div className="match-weather__facts">
            <strong className="match-weather__temp">
              {w.temperatureC != null ? `${w.temperatureC}°C` : '—'}
            </strong>
            <span className="match-weather__desc">{w.label}</span>
            <span className="match-weather__extra">
              {w.precipProbability != null && (
                <span>💧 {w.precipProbability}%</span>
              )}
              {w.windKmh != null && <span>💨 {w.windKmh} km/h</span>}
            </span>
            {when && (
              <span className="match-weather__when">
                Horário ref. {when} <small>(SP)</small>
              </span>
            )}
          </div>
        </div>
      )}

      {state.status === 'empty' && (
        <div className="match-weather__empty">
          <p className="match-weather__muted">
            {state.data?.error || 'Previsão indisponível'}
            {city && city !== 'a confirmar' ? ` · ${city}` : ''}
          </p>
          <button type="button" className="btn match-weather__retry touch" onClick={onRetry}>
            Tentar de novo
          </button>
        </div>
      )}
    </div>
  )
}
