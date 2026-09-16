/**
 * TheSportsDB free public API (test key "123") — CORS *, no signup.
 * Useful fallback for próximo jogo when ESPN schedule lags.
 */
import { fetchJson } from './fetchJson.js'

const BASE = 'https://www.thesportsdb.com/api/v1/json/123'
export const PALMEIRAS_TSDB_ID = '134465'

function mapEvent(e, finished) {
  if (!e) return null
  const home = e.strHomeTeam
  const away = e.strAwayTeam
  const isHome = /palmeiras/i.test(home)
  const opponent = isHome ? away : home
  const date =
    e.strTimestamp ||
    (e.dateEvent && e.strTime
      ? `${e.dateEvent}T${e.strTime}Z`
      : e.dateEvent
        ? `${e.dateEvent}T00:00:00Z`
        : null)
  if (!date) return null

  let score = null
  let result = null
  if (finished && e.intHomeScore != null && e.intHomeScore !== '' && e.intAwayScore != null) {
    const hs = Number(e.intHomeScore)
    const as = Number(e.intAwayScore)
    score = { home: hs, away: as }
    const our = isHome ? hs : as
    const their = isHome ? as : hs
    result = our > their ? 'W' : our < their ? 'L' : 'D'
  }

  const league = e.strLeague || 'Competição'
  const code = /libertadores/i.test(league)
    ? 'LIB'
    : /copa do brasil|brazil cup/i.test(league)
      ? 'CDB'
      : /serie a|brasileir|brazil/i.test(league)
        ? 'BSA'
        : 'OTH'

  return {
    id: `tsdb-${e.idEvent}`,
    competition: league.replace(/^Brazilian Serie A$/i, 'Brasileirão Série A'),
    competitionCode: code,
    homeTeam: home,
    awayTeam: away,
    isHome,
    opponent,
    date,
    venue: e.strVenue || 'A definir',
    status: finished ? 'FINISHED' : 'SCHEDULED',
    score,
    result,
  }
}

export async function fetchSportsDbNextLast(signal) {
  const [nextJson, lastJson] = await Promise.all([
    fetchJson(`${BASE}/eventsnext.php?id=${PALMEIRAS_TSDB_ID}`, { signal }).catch(() => ({
      events: [],
    })),
    fetchJson(`${BASE}/eventslast.php?id=${PALMEIRAS_TSDB_ID}`, { signal }).catch(() => ({
      results: [],
    })),
  ])

  const next = (nextJson.events || []).map((e) => mapEvent(e, false)).filter(Boolean)
  const last = (lastJson.results || []).map((e) => mapEvent(e, true)).filter(Boolean)

  return {
    next,
    last,
    source: 'TheSportsDB',
  }
}
