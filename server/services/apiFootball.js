/**
 * API-Football (api-sports.io)
 * Palmeiras team id: 121
 * Brasileirão: 71 | Libertadores: 13 | Copa do Brasil: 73
 *
 * Plano Free: tipicamente só libera temporadas 2022–2024.
 * Tentamos a temporada civil atual e caímos para a mais recente disponível.
 */
import fetch from 'node-fetch'

const BASE = 'https://v3.football.api-sports.io'
const TEAM_ID = 121
const LEAGUES = {
  BSA: 71,
  LIB: 13,
  CDB: 73,
}

function headers(key) {
  return {
    'x-apisports-key': key,
    Accept: 'application/json',
  }
}

async function apiGet(path, key) {
  const res = await fetch(`${BASE}${path}`, {
    headers: headers(key),
    timeout: 15000,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API-Football ${res.status}: ${text.slice(0, 120)}`)
  }
  const json = await res.json()
  if (json.errors && Object.keys(json.errors).length) {
    const err = new Error(`API-Football: ${JSON.stringify(json.errors)}`)
    err.apiErrors = json.errors
    throw err
  }
  return json.response || []
}

function preferredSeason() {
  const d = new Date()
  // Brasileirão: antes de março ainda conta a temporada anterior
  return d.getMonth() < 2 ? d.getFullYear() - 1 : d.getFullYear()
}

function seasonCandidates() {
  const preferred = preferredSeason()
  // Free plans documentados: 2022–2024; tentamos preferred → preferred-1 → 2024…2022
  const list = [preferred, preferred - 1, 2024, 2023, 2022]
  return [...new Set(list)].filter((y) => y >= 2022)
}

function isSeasonPlanError(err) {
  const msg = String(err?.message || '')
  const plan = err?.apiErrors?.plan || ''
  return /do not have access to this season/i.test(msg) || /do not have access to this season/i.test(plan)
}

async function resolveSeason(key) {
  const candidates = seasonCandidates()
  let lastErr = null
  for (const season of candidates) {
    try {
      const standings = await apiGet(`/standings?league=${LEAGUES.BSA}&season=${season}`, key)
      const rows = standings?.[0]?.league?.standings?.[0] || []
      if (rows.length) {
        return {
          season,
          standingsRes: standings,
          note:
            season !== preferredSeason()
              ? `Plano Free: temporada ${season} (mais recente disponível na API; ${preferredSeason()} ainda não liberada).`
              : null,
        }
      }
    } catch (err) {
      lastErr = err
      if (isSeasonPlanError(err)) continue
      throw err
    }
  }
  throw lastErr || new Error('Nenhuma temporada do Brasileirão disponível na API-Football')
}

function mapFixture(fx) {
  const home = fx.teams.home
  const away = fx.teams.away
  const isHome = home.id === TEAM_ID
  const opponent = isHome ? away.name : home.name
  const statusShort = fx.fixture.status.short
  const finished = ['FT', 'AET', 'PEN'].includes(statusShort)
  let result = null
  let score = null
  if (finished && fx.goals.home != null) {
    score = { home: fx.goals.home, away: fx.goals.away }
    const our = isHome ? fx.goals.home : fx.goals.away
    const their = isHome ? fx.goals.away : fx.goals.home
    result = our > their ? 'W' : our < their ? 'L' : 'D'
  }
  const leagueName =
    fx.league.id === LEAGUES.LIB
      ? 'Libertadores'
      : fx.league.id === LEAGUES.CDB
        ? 'Copa do Brasil'
        : fx.league.name || 'Brasileirão Série A'

  return {
    id: String(fx.fixture.id),
    competition: leagueName,
    competitionCode:
      fx.league.id === LEAGUES.LIB ? 'LIB' : fx.league.id === LEAGUES.CDB ? 'CDB' : 'BSA',
    homeTeam: home.name,
    awayTeam: away.name,
    isHome,
    opponent,
    date: fx.fixture.date,
    venue: fx.fixture.venue?.name
      ? `${fx.fixture.venue.name}${fx.fixture.venue.city ? `, ${fx.fixture.venue.city}` : ''}`
      : 'A definir',
    status: finished ? 'FINISHED' : statusShort === 'NS' || statusShort === 'TBD' ? 'SCHEDULED' : statusShort,
    score,
    result,
  }
}

export async function fetchFromApiFootball(key) {
  const { season, standingsRes, note } = await resolveSeason(key)
  const leagueIds = [LEAGUES.BSA, LEAGUES.LIB, LEAGUES.CDB]

  const fixturePromises = leagueIds.map((id) =>
    apiGet(`/fixtures?team=${TEAM_ID}&league=${id}&season=${season}`, key).catch(() => [])
  )
  const [scorersRes, ...fixtureGroups] = await Promise.all([
    apiGet(`/players/topscorers?league=${LEAGUES.BSA}&season=${season}`, key).catch(() => []),
    ...fixturePromises,
  ])

  const allFixtures = fixtureGroups.flat().map(mapFixture)
  const now = Date.now()
  const upcoming = allFixtures
    .filter((f) => f.status === 'SCHEDULED' && new Date(f.date).getTime() >= now - 3600000)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  const recentResults = allFixtures
    .filter((f) => f.status === 'FINISHED')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)

  const nextMatch = upcoming[0] || null
  const form = recentResults
    .slice(0, 5)
    .map((r) => r.result)
    .filter(Boolean)

  const standingBlock = standingsRes?.[0]?.league?.standings?.[0] || []
  const table = standingBlock.map((row) => ({
    position: row.rank,
    team: row.team.name,
    played: row.all.played,
    won: row.all.win,
    draw: row.all.draw,
    lost: row.all.lose,
    gf: row.all.goals.for,
    ga: row.all.goals.against,
    gd: row.goalsDiff,
    points: row.points,
    form: (row.form || '').replace(/[^WDL]/g, ''),
    highlight: row.team.id === TEAM_ID,
  }))

  const palmeirasRow = table.find((r) => r.highlight || /palmeiras/i.test(r.team))
  let stats = null
  if (palmeirasRow) {
    stats = {
      played: palmeirasRow.played,
      won: palmeirasRow.won,
      draw: palmeirasRow.draw,
      lost: palmeirasRow.lost,
      goalsFor: palmeirasRow.gf,
      goalsAgainst: palmeirasRow.ga,
      points: palmeirasRow.points,
      position: palmeirasRow.position,
    }
  }

  // Artilharia: liga inteira → prioriza jogadores do Palmeiras; se poucos, completa com top geral
  const mappedScorers = (scorersRes || []).map((p) => ({
    name: p.player.name,
    goals: p.statistics?.[0]?.goals?.total ?? 0,
    assists: p.statistics?.[0]?.goals?.assists ?? 0,
    teamId: p.statistics?.[0]?.team?.id,
    team: p.statistics?.[0]?.team?.name,
  }))
  const palmeirasScorers = mappedScorers.filter((p) => p.teamId === TEAM_ID)
  let topScorers = (palmeirasScorers.length ? palmeirasScorers : mappedScorers).slice(0, 8)

  return {
    mode: 'live',
    label: note
      ? `Dados ao vivo via API-Football · ${note}`
      : 'Dados ao vivo via API-Football',
    provider: 'api-football',
    seasonNote: note,
    updatedAt: new Date().toISOString(),
    team: { id: TEAM_ID, name: 'Palmeiras', shortName: 'PAL' },
    nextMatch,
    form,
    recentResults,
    upcoming: upcoming.slice(0, 12),
    standings: {
      competition: 'Brasileirão Série A',
      season: String(season),
      table,
    },
    stats,
    topScorers,
  }
}
