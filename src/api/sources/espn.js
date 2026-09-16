/**
 * ESPN public site APIs — no key, CORS *.
 * Standings (multi-liga), schedule, roster (+ cartões), lineup/formação.
 */
import { fetchJson } from './fetchJson.js'

const ESPN = 'https://site.api.espn.com'
const ESPN_V2 = 'https://site.api.espn.com/apis/v2'
export const PALMEIRAS_ESPN_ID = '2029'

export const LEAGUES = {
  BSA: { slug: 'bra.1', name: 'Brasileirão Série A', code: 'BSA', hasTable: true },
  LIB: { slug: 'conmebol.libertadores', name: 'Libertadores', code: 'LIB', hasTable: true, groupOnly: true },
  CDB: { slug: 'bra.copa_do_brasil', name: 'Copa do Brasil', code: 'CDB', hasTable: false },
  PAU: { slug: 'bra.camp.paulista', name: 'Paulistão', code: 'PAU', hasTable: true },
}

const POS_PT = {
  G: 'Goleiro',
  Goalkeeper: 'Goleiro',
  D: 'Defensor',
  Defender: 'Defensor',
  M: 'Meia',
  Midfielder: 'Meia',
  F: 'Atacante',
  Forward: 'Atacante',
  Attacker: 'Atacante',
}

const POS_ORDER = { G: 0, D: 1, M: 2, F: 3 }

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
  const live = /IN_PROGRESS|HALFTIME|LIVE/i.test(statusName)
  const scheduled =
    statusName === 'STATUS_SCHEDULED' ||
    statusName === 'STATUS_PRE' ||
    (!finished && !live)

  let score = null
  let result = null
  if (finished || live) {
    const hs = scoreValue(home.score)
    const as = scoreValue(away.score)
    if (hs != null && as != null) {
      score = { home: hs, away: as }
      if (finished) {
        const our = isHome ? hs : as
        const their = isHome ? as : hs
        result = our > their ? 'W' : our < their ? 'L' : 'D'
      }
    }
  }

  const venue = comp.venue?.fullName
    ? `${comp.venue.fullName}${comp.venue.address?.city ? `, ${comp.venue.address.city}` : ''}`
    : 'A definir'

  return {
    id: String(event.id || `${leagueMeta.code}-${event.date}-${opponent}`),
    espnEventId: String(event.id || ''),
    competition: leagueMeta.name,
    competitionCode: leagueMeta.code,
    leagueSlug: leagueMeta.slug,
    homeTeam: home.team?.displayName || home.team?.name || '—',
    awayTeam: away.team?.displayName || away.team?.name || '—',
    isHome,
    opponent,
    date: event.date,
    venue,
    status: finished ? 'FINISHED' : live ? 'LIVE' : scheduled ? 'SCHEDULED' : statusName || 'SCHEDULED',
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

function mapStandingEntry(row) {
  const stats = Object.fromEntries((row.stats || []).map((s) => [s.name, s]))
  const num = (key) => {
    const v = stats[key]?.value
    return v == null ? 0 : Number(v)
  }
  const teamName = row.team?.displayName || row.team?.name || '—'
  const id = String(row.team?.id || '')
  const rankChangeRaw = stats.rankChange?.value
  const rankChange =
    rankChangeRaw == null || rankChangeRaw === '' ? 0 : Number(rankChangeRaw)

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
    rankChange: Number.isFinite(rankChange) ? rankChange : 0,
    highlight: id === PALMEIRAS_ESPN_ID || /palmeiras/i.test(teamName),
  }
}

function parseStandingsChildren(json, leagueMeta) {
  const children = json.children || []
  const season =
    String(json.season?.year || children[0]?.season?.year || new Date().getFullYear())

  if (leagueMeta.groupOnly) {
    // Libertadores: only Palmeiras' group (or all groups that contain Palmeiras)
    const groups = []
    for (const child of children) {
      const entries = (child.standings?.entries || []).map(mapStandingEntry)
      entries.sort((a, b) => a.position - b.position || b.points - a.points)
      const hasPal = entries.some((r) => r.highlight)
      if (hasPal && entries.length) {
        groups.push({
          competition: leagueMeta.name,
          competitionCode: leagueMeta.code,
          group: child.name || child.abbreviation || 'Grupo',
          season,
          table: entries,
          note: null,
        })
      }
    }
    return groups
  }

  // Flat league table (may have one child)
  const entries = []
  for (const child of children) {
    for (const row of child.standings?.entries || []) {
      entries.push(mapStandingEntry(row))
    }
  }
  if (!entries.length) return []
  entries.sort((a, b) => a.position - b.position || b.points - a.points)
  // Re-number if ranks missing
  entries.forEach((r, i) => {
    if (!r.position) r.position = i + 1
  })
  const hasPal = entries.some((r) => r.highlight)
  if (!hasPal) return [] // skip competitions where Palmeiras isn't listed
  return [
    {
      competition: leagueMeta.name,
      competitionCode: leagueMeta.code,
      group: null,
      season,
      table: entries,
      note: null,
    },
  ]
}

export async function fetchEspnStandings(signal) {
  // Back-compat: Brasileirão only (used for home mini-stats)
  const json = await fetchJson(`${ESPN_V2}/sports/soccer/bra.1/standings`, { signal })
  const tables = parseStandingsChildren(json, LEAGUES.BSA)
  if (!tables.length) throw new Error('ESPN standings vazio')
  const standings = tables[0]
  const pal = standings.table.find((r) => r.highlight)
  return {
    standings: {
      competition: standings.competition,
      season: standings.season,
      table: standings.table,
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

/** All competitions where Palmeiras appears in standings. */
export async function fetchEspnAllStandings(signal) {
  const errors = []
  const competitions = []
  const targets = [LEAGUES.BSA, LEAGUES.LIB, LEAGUES.PAU]

  await Promise.all(
    targets.map(async (lg) => {
      try {
        const json = await fetchJson(`${ESPN_V2}/sports/soccer/${lg.slug}/standings`, {
          signal,
          timeoutMs: 16000,
        })
        const tables = parseStandingsChildren(json, lg)
        competitions.push(...tables)
      } catch (err) {
        errors.push(`${lg.code}: ${err.message}`)
      }
    })
  )

  // Copa do Brasil is knockout — no league table; note only if schedule has events
  competitions.sort((a, b) => {
    const order = { BSA: 0, LIB: 1, PAU: 2, CDB: 3 }
    return (order[a.competitionCode] ?? 9) - (order[b.competitionCode] ?? 9)
  })

  const bsa = competitions.find((c) => c.competitionCode === 'BSA')
  const pal = bsa?.table?.find((r) => r.highlight)

  return {
    competitions,
    standings: bsa
      ? { competition: bsa.competition, season: bsa.season, table: bsa.table }
      : { competition: 'Brasileirão Série A', season: String(new Date().getFullYear()), table: [] },
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
    source: 'ESPN (campeonatos)',
    errors,
  }
}

export async function fetchEspnMatches(signal) {
  const errors = []
  const scheduleLeagues = [LEAGUES.BSA, LEAGUES.LIB, LEAGUES.PAU, LEAGUES.CDB]
  const schedules = await Promise.all(
    scheduleLeagues.map(async (lg) => {
      try {
        return await teamSchedule(lg, signal)
      } catch (err) {
        errors.push(`${lg.code} schedule: ${err.message}`)
        return []
      }
    })
  )

  const days = []
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  for (let i = 0; i < 14; i++) {
    const d = new Date(start)
    d.setUTCDate(d.getUTCDate() + i)
    days.push(yyyymmdd(d))
  }

  const scoreboardLeagues = [LEAGUES.BSA, LEAGUES.LIB, LEAGUES.PAU]
  const upcomingPools = await mapPool(days, 4, async (dateStr) => {
    const parts = await Promise.all(
      scoreboardLeagues.map(async (lg) => {
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
  // Segunda passagem: dedupe lógico (dia+competição+mando) caso IDs divergem
  const byLogic = new Map()
  for (const m of byId.values()) {
    const day = (m.date || '').slice(0, 10)
    const logic = `${day}|${m.competitionCode || ''}|${m.isHome ? 'H' : 'A'}`
    const prev = byLogic.get(logic)
    if (!prev) byLogic.set(logic, m)
    else if ((m.score && !prev.score) || (m.espnEventId && !prev.espnEventId)) byLogic.set(logic, m)
  }
  const all = [...byLogic.values()]
  const now = Date.now() - 60 * 60 * 1000

  const recentResults = all
    .filter((m) => m.status === 'FINISHED')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 16)

  const upcoming = all
    .filter((m) => {
      if (m.status === 'LIVE') return true
      return m.status === 'SCHEDULED' && new Date(m.date).getTime() >= now
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 16)

  return {
    recentResults,
    upcoming,
    nextMatch: upcoming[0] || null,
    form: recentResults
      .slice(0, 5)
      .map((r) => r.result)
      .filter(Boolean),
    allMatches: all,
    source: 'ESPN (jogos)',
    errors,
  }
}

function extractAthleteStat(athlete, name) {
  const cats = athlete.statistics?.splits?.categories || []
  for (const c of cats) {
    const s = (c.stats || []).find((x) => x.name === name)
    if (s && s.value != null) return Number(s.value) || 0
  }
  return 0
}

function mapAthlete(a) {
  const abbr = a.position?.abbreviation || 'M'
  const posKey = abbr.charAt(0)
  const group =
    posKey === 'G' ? 'G' : posKey === 'D' ? 'D' : posKey === 'F' ? 'F' : 'M'
  return {
    id: String(a.id),
    name: a.displayName || a.fullName || a.shortName || '—',
    shortName: a.shortName || a.displayName || '—',
    jersey: a.jersey != null && a.jersey !== '' ? String(a.jersey) : null,
    position: group,
    positionLabel: POS_PT[a.position?.name] || POS_PT[group] || a.position?.displayName || '—',
    positionDetail: a.position?.displayName || a.position?.name || null,
    age: a.age ?? null,
    nationality: a.citizenshipCountry?.abbreviation || a.flag?.alt || null,
    status: a.status?.type || a.status?.abbreviation || 'active',
    yellowCards: extractAthleteStat(a, 'yellowCards'),
    redCards: extractAthleteStat(a, 'redCards'),
    appearances: extractAthleteStat(a, 'appearances'),
    goals: extractAthleteStat(a, 'totalGoals'),
    assists: extractAthleteStat(a, 'goalAssists'),
  }
}

export async function fetchEspnRoster(signal) {
  const json = await fetchJson(
    `${ESPN}/apis/site/v2/sports/soccer/bra.1/teams/${PALMEIRAS_ESPN_ID}/roster`,
    { signal, timeoutMs: 20000 }
  )
  const athletes = (json.athletes || []).map(mapAthlete)
  if (!athletes.length) throw new Error('ESPN roster vazio')

  athletes.sort((a, b) => {
    const po = (POS_ORDER[a.position] ?? 9) - (POS_ORDER[b.position] ?? 9)
    if (po !== 0) return po
    const ja = a.jersey != null ? Number(a.jersey) : 999
    const jb = b.jersey != null ? Number(b.jersey) : 999
    if (ja !== jb) return ja - jb
    return a.name.localeCompare(b.name, 'pt-BR')
  })

  const byPosition = {
    G: athletes.filter((p) => p.position === 'G'),
    D: athletes.filter((p) => p.position === 'D'),
    M: athletes.filter((p) => p.position === 'M'),
    F: athletes.filter((p) => p.position === 'F'),
  }

  const cards = athletes
    .filter((p) => p.yellowCards > 0 || p.redCards > 0)
    .sort((a, b) => b.yellowCards - a.yellowCards || b.redCards - a.redCards || a.name.localeCompare(b.name, 'pt-BR'))
    .map((p) => ({
      id: p.id,
      name: p.name,
      jersey: p.jersey,
      position: p.position,
      positionLabel: p.positionLabel,
      yellowCards: p.yellowCards,
      redCards: p.redCards,
      appearances: p.appearances,
    }))

  const season = String(json.season?.year || new Date().getFullYear())

  return {
    squad: athletes,
    byPosition,
    cards,
    cardsSeason: season,
    cardsCompetition: 'Brasileirão Série A (stats ESPN)',
    source: 'ESPN (elenco)',
  }
}

async function fetchSummaryLineup(leagueSlug, eventId, signal) {
  const url = `${ESPN}/apis/site/v2/sports/soccer/${leagueSlug}/summary?event=${eventId}`
  const json = await fetchJson(url, { signal, timeoutMs: 16000 })
  const pal = (json.rosters || []).find(
    (r) =>
      String(r.team?.id) === PALMEIRAS_ESPN_ID ||
      /palmeiras/i.test(r.team?.displayName || r.team?.name || '')
  )
  if (!pal?.roster?.length) return null

  const formation = pal.formation || null
  const starters = pal.roster
    .filter((p) => p.starter)
    .map((p) => ({
      id: String(p.athlete?.id || ''),
      name: p.athlete?.displayName || p.athlete?.shortName || '—',
      shortName: p.athlete?.shortName || p.athlete?.displayName || '—',
      jersey: p.jersey != null ? String(p.jersey) : null,
      formationPlace: p.formationPlace != null ? String(p.formationPlace) : null,
      position: p.position?.abbreviation || p.position?.name || null,
    }))
  const bench = pal.roster
    .filter((p) => !p.starter)
    .map((p) => ({
      id: String(p.athlete?.id || ''),
      name: p.athlete?.displayName || p.athlete?.shortName || '—',
      shortName: p.athlete?.shortName || p.athlete?.displayName || '—',
      jersey: p.jersey != null ? String(p.jersey) : null,
      position: p.position?.abbreviation || 'SUB',
    }))

  if (starters.length < 11 && !formation) return null

  const header = json.header?.competitions?.[0]
  const home = header?.competitors?.find((c) => c.homeAway === 'home')
  const away = header?.competitors?.find((c) => c.homeAway === 'away')

  return {
    formation,
    starters,
    bench,
    kind: 'last', // última escalação conhecida (não inventamos “provável”)
    match: {
      id: String(eventId),
      homeTeam: home?.team?.displayName || home?.team?.abbreviation || '—',
      awayTeam: away?.team?.displayName || away?.team?.abbreviation || '—',
      date: header?.date || json.header?.competitions?.[0]?.date || null,
      score:
        home?.score != null && away?.score != null
          ? { home: Number(home.score), away: Number(away.score) }
          : null,
    },
  }
}

/** Última escalação + formação disponíveis no ESPN (resumo do jogo). */
export async function fetchEspnLineup(signal, matchesHint = []) {
  const errors = []
  // Prefer matches with espn ids, newest finished first
  const candidates = (matchesHint || [])
    .filter((m) => m.status === 'FINISHED' && m.espnEventId && m.leagueSlug)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)

  // If hint empty, pull recent schedules
  if (!candidates.length) {
    for (const lg of [LEAGUES.BSA, LEAGUES.LIB, LEAGUES.PAU]) {
      try {
        const evs = await teamSchedule(lg, signal)
        for (const m of evs
          .filter((x) => x.status === 'FINISHED')
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3)) {
          candidates.push(m)
        }
      } catch (err) {
        errors.push(`${lg.code}: ${err.message}`)
      }
    }
    candidates.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const seen = new Set()
  for (const m of candidates) {
    const key = `${m.leagueSlug}:${m.espnEventId}`
    if (seen.has(key)) continue
    seen.add(key)
    try {
      const lineup = await fetchSummaryLineup(m.leagueSlug, m.espnEventId, signal)
      if (lineup) {
        return {
          lineup: {
            ...lineup,
            competition: m.competition,
            competitionCode: m.competitionCode,
            label: `Última escalação · ${m.competition}`,
          },
          source: 'ESPN (escalação)',
          errors,
        }
      }
    } catch (err) {
      errors.push(`summary ${m.espnEventId}: ${err.message}`)
    }
  }

  return {
    lineup: null,
    source: 'ESPN (escalação)',
    errors: errors.length ? errors : ['Nenhuma escalação com formação encontrada'],
  }
}
