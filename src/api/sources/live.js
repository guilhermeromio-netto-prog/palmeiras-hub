/**
 * Placar ao vivo via ESPN summary (público, sem key).
 * Nunca inventa placar — se falhar, devolve erro/null.
 */
import { fetchJson } from './fetchJson.js'
import { PALMEIRAS_ESPN_ID, LEAGUES } from './espn.js'
import { isTodaySP, msUntil } from '../../utils/datetime.js'

const ESPN = 'https://site.api.espn.com'

function scoreValue(comp) {
  if (comp == null) return null
  if (typeof comp === 'number') return comp
  if (typeof comp === 'object' && comp.value != null) return Number(comp.value)
  if (typeof comp === 'object' && comp.displayValue != null) return Number(comp.displayValue)
  const n = Number(comp)
  return Number.isFinite(n) ? n : null
}

function mapStatus(statusType) {
  const name = statusType?.name || ''
  const state = statusType?.state || ''
  if (
    name === 'STATUS_FULL_TIME' ||
    name === 'STATUS_FINAL' ||
    statusType?.completed === true ||
    state === 'post'
  ) {
    return 'FINISHED'
  }
  if (/IN_PROGRESS|HALFTIME|LIVE|STATUS_FIRST_HALF|STATUS_SECOND_HALF|STATUS_EXTRA/i.test(name) || state === 'in') {
    return 'LIVE'
  }
  return 'SCHEDULED'
}

function mapKeyEvents(events) {
  const scorers = []
  const cards = []
  for (const ev of events || []) {
    const type = ev.type?.type || ''
    const clock = ev.clock?.displayValue || ''
    const player =
      ev.participants?.[0]?.athlete?.displayName ||
      (ev.shortText || '').replace(/\s+(Goal|Yellow Card|Red Card).*$/i, '') ||
      null
    const team = ev.team?.displayName || null
    const teamId = ev.team?.id != null ? String(ev.team.id) : null
    if (ev.scoringPlay || type === 'goal' || type === 'own-goal' || type === 'penalty-goal') {
      scorers.push({
        player: player || '—',
        team,
        teamId,
        clock,
        ownGoal: type === 'own-goal',
        penalty: type === 'penalty-goal' || /penalty/i.test(ev.text || ''),
        isPalmeiras: teamId === PALMEIRAS_ESPN_ID || /palmeiras/i.test(team || ''),
      })
    } else if (type === 'yellow-card' || type === 'red-card' || type === 'second-yellow-red-card') {
      cards.push({
        player: player || '—',
        team,
        teamId,
        clock,
        color: type.includes('red') || type.includes('second-yellow') ? 'red' : 'yellow',
        isPalmeiras: teamId === PALMEIRAS_ESPN_ID || /palmeiras/i.test(team || ''),
      })
    }
  }
  return { scorers, cards }
}

/**
 * Escolhe o jogo do dia (SP) mais relevante para o centro ao vivo.
 */
export function findLiveCandidate(data) {
  if (!data) return null
  const pool = []
  const seen = new Set()
  for (const m of [data.nextMatch, ...(data.upcoming || []), ...(data.recentResults || [])]) {
    if (!m || !isTodaySP(m.date)) continue
    const key = m.espnEventId || m.id
    if (seen.has(key)) continue
    seen.add(key)
    pool.push(m)
  }
  if (!pool.length) return null

  const rank = (m) => {
    if (m.status === 'LIVE') return 0
    if (m.status === 'SCHEDULED') {
      const ms = msUntil(m.date)
      if (ms != null && ms <= 15 * 60 * 1000) return 1 // kickoff próximo ou passado
      return 3
    }
    if (m.status === 'FINISHED') return 2
    return 4
  }
  pool.sort((a, b) => rank(a) - rank(b) || new Date(a.date) - new Date(b.date))
  const best = pool[0]
  if (!best.espnEventId || !best.leagueSlug) {
    // tenta inferir slug pelo código
    const lg = Object.values(LEAGUES).find((l) => l.code === best.competitionCode)
    if (lg) return { ...best, leagueSlug: best.leagueSlug || lg.slug }
    return best.espnEventId ? best : null
  }
  return best
}

/** Deve fazer polling? LIVE ou janela pré/pós apito no dia. */
export function shouldPollLive(match, liveStatus) {
  if (!match) return false
  const status = liveStatus || match.status
  if (status === 'LIVE') return true
  if (status === 'FINISHED') return false
  if (!isTodaySP(match.date)) return false
  const ms = msUntil(match.date)
  if (ms == null) return false
  // 15 min antes → até ~3h depois do apito (sem FT confirmado)
  return ms <= 15 * 60 * 1000 && ms > -3 * 60 * 60 * 1000
}

export async function fetchEspnLiveSummary({ leagueSlug, eventId, signal } = {}) {
  if (!leagueSlug || !eventId) throw new Error('eventId/leagueSlug ausentes')
  const url = `${ESPN}/apis/site/v2/sports/soccer/${leagueSlug}/summary?event=${eventId}`
  const json = await fetchJson(url, { signal, timeoutMs: 12000 })
  const header = json.header?.competitions?.[0]
  if (!header) throw new Error('ESPN summary sem competição')

  const home = header.competitors?.find((c) => c.homeAway === 'home')
  const away = header.competitors?.find((c) => c.homeAway === 'away')
  const statusType = header.status?.type || json.header?.status?.type
  const status = mapStatus(statusType)
  const clock =
    header.status?.displayClock ||
    statusType?.detail ||
    statusType?.shortDetail ||
    (status === 'LIVE' ? 'Ao vivo' : status === 'FINISHED' ? 'FT' : null)

  const hs = scoreValue(home?.score)
  const as = scoreValue(away?.score)
  const score =
    hs != null && as != null && (status === 'LIVE' || status === 'FINISHED')
      ? { home: hs, away: as }
      : null

  const { scorers, cards } = mapKeyEvents(json.keyEvents || [])

  const homeId = String(home?.id || home?.team?.id || '')
  const isHome = homeId === PALMEIRAS_ESPN_ID

  const awayId = String(away?.id || away?.team?.id || '')
  const homeLogo =
    home?.team?.logos?.find((l) => l.rel?.includes('full'))?.href ||
    home?.team?.logos?.[0]?.href ||
    null
  const awayLogo =
    away?.team?.logos?.find((l) => l.rel?.includes('full'))?.href ||
    away?.team?.logos?.[0]?.href ||
    null

  return {
    eventId: String(eventId),
    leagueSlug,
    status,
    clock,
    statusDetail: statusType?.description || statusType?.detail || null,
    homeTeam: home?.team?.displayName || home?.team?.abbreviation || '—',
    awayTeam: away?.team?.displayName || away?.team?.abbreviation || '—',
    homeEspnId: homeId || null,
    awayEspnId: awayId || null,
    homeLogoUrl: homeLogo,
    awayLogoUrl: awayLogo,
    isHome,
    score,
    scorers,
    cards,
    date: header.date || null,
    fetchedAt: new Date().toISOString(),
    source: 'ESPN (ao vivo)',
  }
}
