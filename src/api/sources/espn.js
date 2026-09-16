/**
 * ESPN public site APIs — no key, CORS *.
 * Standings + schedules + short-horizon scoreboards for upcoming fixtures.
 */
import { fetchJson } from './fetchJson.js'

const ESPN = 'https://site.api.espn.com'
const ESPN_V2 = 'https://site.api.espn.com/apis/v2'
export const PALMEIRAS_ESPN_ID = '2029'

const LEAGUES = {
  BSA: { slug: 'bra.1', name: 'Brasileirão Série A', code: 'BSA' },
  LIB: { slug: 'conmebol.libertadores', name: 'Libertadores', code: 'LIB' },
  CDB: { slug: 'bra.copa_do_brasil', name: 'Copa do Brasil', code: 'CDB' },
}

function scoreValue(comp) {
  if (comp == null) return null
  if (typeof comp === 'number') return comp
  if (typeof comp === 'object' && comp.value != null) return Number(comp.value)
  if (typeof comp === 'object' && comp.displayValue != null) return Number(comp.displayValue)
  const n = Number(comp)
  return Number.isFinite(n) ? n : null
}

function mapEspnEvent(event, leagueMeta) {
  const comp = event.competitions?.[0]
  if (!comp) return null
  const home = comp.competitors?.find((c) => c.homeAway === 'home')
  const away = comp.competitors?.find((c) => c.homeAway === 'away')
  if (!home || !away) return null

  const homeId = String(home.id || home.team?.id || '')
  const isHome = homeId === PALMEIRAS_ESPN_ID
  const opponent = isHome
    ? away.team?.displayName || away.team?.name
    : home.team?.displayName || home.team?.name

  const statusName = comp.status?.type?.name || event.status?.type?.name || ''
  const finished =
    statusName === 'STATUS_FULL_TIME' ||
    statusName === 'STATUS_FINAL' ||
    comp.status?.type?.completed === true
  const scheduled =
    statusName === 'STATUS_SCHEDULED' ||
    statusName === 'STATUS_PRE' ||
    (!finished && !/IN_PROGRESS|HALFTIME|LIVE/i.test(statusName))

  let score = null
  let result = null
  if (finished) {
    const hs = scoreValue(home.score)
    const as = scoreValue(away.score)
    if (hs != null && as != null) {
      score = { home: hs, away: as }
      const our = isHome ? hs : as
      const their = isHome ? as : hs
      result = our > their ? 'W' : our < their ? 'L' : 'D'
    }
  }

  const venue = comp.venue?.fullName
    ? `${comp.venue.fullName}${comp.venue.address?.city ? `, ${comp.venue.address.city}` : ''}`
    : 'A definir'

  return {
    id: String(event.id || `${leagueMeta.code}-${event.date}-${opponent}`),
    competition: leagueMeta.name,
    competitionCode: leagueMeta.code,
    homeTeam: home.team?.displayName || home.team?.name || '—',
    awayTeam: away.team?.displayName || away.team?.name || '—',
    isHome,
    opponent,
    date: event.date,
    venue,
    status: finished ? 'FINISHED' : scheduled ? 'SCHEDULED' : statusName || 'SCHEDULED',
    score,
    result,
  }
}

async function teamSchedule(leagueMeta, signal) {
  const url = `${ESPN}/apis/site/v2/sports/soccer/${leagueMeta.slug}/teams/${PALMEIRAS_ESPN_ID}/schedule`
  const json = await fetchJson(url, { signal })
  return (json.events || [])
    .map((e) => mapEspnEvent(e, leagueMeta))
    .filter(Boolean)
}

function yyyymmdd(d) {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

/** Scoreboard for a single UTC day — used to discover upcoming fixtures. */
async function scoreboardDay(leagueMeta, dateStr, signal) {
  const url = `${ESPN}/apis/site/v2/sports/soccer/${leagueMeta.slug}/scoreboard?dates=${dateStr}`
  const json = await fetchJson(url, { signal, timeoutMs: 10000 })
  return (json.events || [])
    .filter((e) => /palmeiras/i.test(e.name || '') || /palmeiras/i.test(e.shortName || ''))
    .map((e) => mapEspnEvent(e, leagueMeta))
    .filter(Boolean)
}

async function mapPool(items, limit, fn) {
  const out = []
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      out[idx] = await fn(items[idx])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return out
}

export async function fetchEspnStandings(signal) {
  const json = await fetchJson(`${ESPN_V2}/sports/soccer/bra.1/standings`, { signal })
  const entries = json.children?.[0]?.standings?.entries || []
  if (!entries.length) throw new Error('ESPN standings vazio')

  const table = entries.map((row) => {
    const stats = Object.fromEntries((row.stats || []).map((s) => [s.name, s]))
    const num = (key) => {
      const v = stats[key]?.value
      return v == null ? 0 : Number(v)
    }
    const teamName = row.team?.displayName || row.team?.name || '—'
    const id = String(row.team?.id || '')
    return {
      position: num('rank') || Number(row.team?.rank) || 0,
      team: teamName,
      played: num('gamesPlayed'),
      won: num('wins'),
      draw: num('ties'),
      lost: num('losses'),
      gf: num('pointsFor'),
      ga: num('pointsAgainst'),
      gd: num('pointDifferential'),
      points: num('points'),
      form: '',
      highlight: id === PALMEIRAS_ESPN_ID || /palmeiras/i.test(teamName),
    }
  })

  table.sort((a, b) => a.position - b.position)
  const pal = table.find((r) => r.highlight)
  const season =
    String(json.season?.year || json.children?.[0]?.season?.year || new Date().getFullYear())

  return {
    standings: {
      competition: 'Brasileirão Série A',
      season,
      table,
    },
    stats: pal
      ? {
          played: pal.played,
          won: pal.won,
          draw: pal.draw,
          lost: pal.lost,
          goalsFor: pal.gf,
          goalsAgainst: pal.ga,
          points: pal.points,
          position: pal.position,
        }
      : null,
    source: 'ESPN (classificação)',
  }
}

export async function fetchEspnMatches(signal) {
  const errors = []
  const schedules = await Promise.all(
    [LEAGUES.BSA, LEAGUES.LIB].map(async (lg) => {
      try {
        return await teamSchedule(lg, signal)
      } catch (err) {
        errors.push(`${lg.code} schedule: ${err.message}`)
        return []
      }
    })
  )

  // Discover upcoming over the next ~14 days via daily scoreboards
  const days = []
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  for (let i = 0; i < 14; i++) {
    const d = new Date(start)
    d.setUTCDate(d.getUTCDate() + i)
    days.push(yyyymmdd(d))
  }

  const upcomingPools = await mapPool(days, 4, async (dateStr) => {
    const parts = await Promise.all(
      [LEAGUES.BSA, LEAGUES.LIB].map(async (lg) => {
        try {
          return await scoreboardDay(lg, dateStr, signal)
        } catch {
          return []
        }
      })
    )
    return parts.flat()
  })

  const byId = new Map()
  for (const m of [...schedules.flat(), ...upcomingPools.flat()]) {
    if (!m) continue
    const prev = byId.get(m.id)
    if (!prev) byId.set(m.id, m)
    else if (m.score && !prev.score) byId.set(m.id, m)
  }
  // Prefer unique by date+opponent too
  const all = [...byId.values()]
  const now = Date.now() - 60 * 60 * 1000

  const recentResults = all
    .filter((m) => m.status === 'FINISHED')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 12)

  const upcoming = all
    .filter((m) => m.status === 'SCHEDULED' && new Date(m.date).getTime() >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 12)

  return {
    recentResults,
    upcoming,
    nextMatch: upcoming[0] || null,
    form: recentResults
      .slice(0, 5)
      .map((r) => r.result)
      .filter(Boolean),
    source: 'ESPN (jogos)',
    errors,
  }
}
