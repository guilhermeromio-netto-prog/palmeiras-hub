import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchEspnLiveSummary,
  findLiveCandidate,
  shouldPollLive,
} from '../api/sources/live'

const POLL_MS = 45000

/**
 * Polling ESPN summary somente enquanto o jogo estiver ao vivo / na janela.
 * Para ao FT; nunca inventa placar.
 */
export function useLiveMatch(hubData) {
  const [live, setLive] = useState(null)
  const [error, setError] = useState(null)
  const [polling, setPolling] = useState(false)
  const timerRef = useRef(null)
  const ctrlRef = useRef(null)
  const candidateRef = useRef(null)
  const liveStatusRef = useRef(null)

  const candidate = findLiveCandidate(hubData)
  candidateRef.current = candidate

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (ctrlRef.current) {
      ctrlRef.current.abort()
      ctrlRef.current = null
    }
    setPolling(false)
  }, [])

  const scheduleNext = useCallback(
    (fn) => {
      timerRef.current = setTimeout(fn, POLL_MS)
      setPolling(true)
    },
    []
  )

  const tick = useCallback(async () => {
    const m = candidateRef.current
    if (!m?.espnEventId || !m?.leagueSlug) {
      clearTimer()
      return
    }
    const ctrl = new AbortController()
    ctrlRef.current = ctrl
    try {
      const summary = await fetchEspnLiveSummary({
        leagueSlug: m.leagueSlug,
        eventId: m.espnEventId,
        signal: ctrl.signal,
      })
      liveStatusRef.current = summary.status
      setLive(summary)
      setError(null)
      if (summary.status === 'FINISHED') {
        clearTimer()
        return
      }
      if (shouldPollLive(m, summary.status)) {
        scheduleNext(tick)
      } else {
        clearTimer()
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Falha no placar ao vivo')
      if (shouldPollLive(m, liveStatusRef.current || m.status)) {
        scheduleNext(tick)
      } else {
        setPolling(false)
      }
    }
  }, [clearTimer, scheduleNext])

  useEffect(() => {
    clearTimer()
    setLive(null)
    setError(null)
    liveStatusRef.current = null
    if (!candidate?.espnEventId || !candidate?.leagueSlug) return undefined

    const wantPoll = shouldPollLive(candidate, candidate.status)
    const finishedToday = candidate.status === 'FINISHED'

    if (wantPoll || finishedToday) {
      tick()
    }

    return () => clearTimer()
  }, [
    candidate?.espnEventId,
    candidate?.leagueSlug,
    candidate?.status,
    hubData?.fetchedAt,
    clearTimer,
    tick,
  ])

  return {
    candidate,
    live,
    error,
    polling,
    refresh: tick,
  }
}
