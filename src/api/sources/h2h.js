/**
 * Histórico do confronto (H2H) a partir de fontes públicas.
 * Nunca inventa placares — só retorna jogos com score conhecido.
 */
import { fetchJson } from './fetchJson.js'
import { sameOpponent, normalizeTeamName } from '../../utils/opponent.js'
import { mergeMatchesByKey } from '../../utils/matchKey.js'

const TSDB = 'https://www.thesportsdb.com/api/v1/json/123'

function leagueCode(league) {
  const l = league || ''
  if (/libertadores/i.test(l)) return 'LIB'
  if (/copa do brasil|brazil cup/i.test(l)) return 'CDB'
  if (/paulista/i.test(l)) return 'PAU'
  if (/serie a|brasileir/i.test(l)) return 'BSA'
  return 'OTH'
}

function competitionLabel(code, league) {
  return code === 'LIB'
    ? 'Libertadores'
    : code === 'BSA'
      ? 'Brasileirão Série A'
      : code === 'CDB'
        ? 'Copa do Brasil'
        : code === 'PAU'
          ? 'Paulistão'
          : (league || 'Competição').replace(/^Brazilian Serie A$/i, 'Brasileirão Série A')
}

function mapTsdbEvent(e) {
  if (!e) return null
  const home = e.strHomeTeam
  const away = e.strAwayTeam
  if (!home || !away) return null
  if (!/palmeiras/i.test(home) && !/palmeiras/i.test(away)) return null
  if (e.intHomeScore == null || e.intHomeScore === '' || e.intAwayScore == null || e.intAwayScore === '') {
    return null // sem placar — não inventamos
  }
  const hs = Number(e.intHomeScore)
  const as = Number(e.intAwayScore)
  if (!Number.isFinite(hs) || !Number.isFinite(as)) return null

  const isHome = /palmeiras/i.test(home)
  const opponent = isHome ? away : home
  const our = isHome ? hs : as
  const their = isHome ? as : hs
  const result = our > their ? 'W' : our < their ? 'L' : 'D'
  const date = e.strTimestamp || (e.dateEvent ? `${e.dateEvent}T12:00:00Z` : null)
  if (!date) return null

  const code = leagueCode(e.strLeague)
  return {
    id: `tsdb-h2h-${e.idEvent}`,
    competition: competitionLabel(code, e.strLeague),
    competitionCode: code,
    homeTeam: home,
    awayTeam: away,
    isHome,
    opponent,
    date,
    venue: e.strVenue || 'A definir',
    status: 'FINISHED',
    score: { home: hs, away: as },
    result,
  }
}

function searchSlug(name) {
  return normalizeTeamName(name).replace(/\s+/g, '_').replace(/_+/g, '_')
}

async function fetchTsdbPair(opponent, signal) {
  const slug = searchSlug(opponent)
  if (!slug) return []
  const variants = new Set([slug])
  if (/liga.*quito|ldu/i.test(opponent) || /quito/i.test(slug)) {
    variants.add('LDU_Quito')
    variants.add('Liga_de_Quito')
    variants.add('Liga_Deportiva_Universitaria')
  }
  const queries = []
  for (const v of variants) {
    queries.push(`Palmeiras_vs_${v}`, `${v}_vs_Palmeiras`)
  }

  const results = await Promise.all(
    [...queries].map(async (q) => {
      try {
        const json = await fetchJson(`${TSDB}/searchevents.php?e=${encodeURIComponent(q)}`, {
          signal,
          timeoutMs: 12000,
        })
        return (json.event || []).map(mapTsdbEvent).filter(Boolean)
      } catch {
        return []
      }
    })
  )
  return results.flat()
}

function fromLocalPool(opponent, pool) {
  return (pool || [])
    .filter((m) => m && m.status === 'FINISHED' && m.score && sameOpponent(m.opponent, opponent))
    .map((m) => ({ ...m }))
}

/**
 * @param {{ opponent: string, localMatches?: object[], signal?: AbortSignal }} opts
 */
export async function fetchHeadToHead({ opponent, localMatches = [], signal } = {}) {
  if (!opponent) {
    return { opponent: null, meetings: [], source: null }
  }

  const local = fromLocalPool(opponent, localMatches)
  let remote = []
  try {
    remote = await fetchTsdbPair(opponent, signal)
  } catch {
    remote = []
  }

  const merged = mergeMatchesByKey(local, remote)
    .filter((m) => m.status === 'FINISHED' && m.score)
    .filter((m) => sameOpponent(m.opponent, opponent))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)

  const sources = []
  if (local.length) sources.push('ESPN/agenda')
  if (remote.length) sources.push('TheSportsDB')

  return {
    opponent,
    meetings: merged,
    source: sources.length ? sources.join(' + ') : null,
  }
}
