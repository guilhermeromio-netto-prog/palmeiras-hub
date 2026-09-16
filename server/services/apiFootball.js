/**
 * API-Football (api-sports.io)
 * Palmeiras team id: 121
 * Brasileirão: 71 | Libertadores: 13 | Copa do Brasil: 73
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
    throw new Error(`API-Football: ${JSON.stringify(json.errors)}`)
  }
  return json.response || []
}

function seasonYear() {
  // Brasileirão runs calendar year; before março ainda é temporada anterior
  const d = new Date()
  return d.getMonth() < 2 ? d.getFullYear() - 1 : d.getFullYear()
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
    status: finished ? 'FINISHED' : statusShort === 'NS' ? 'SCHEDULED' : statusShort,
    score,
    result,
  }
}

export async function fetchFromApiFootball(key) {
  const season = seasonYear()
  const leagueIds = [LEAGUES.BSA, LEAGUES.LIB, LEAGUES.CDB]

  const fixturePromises = leagueIds.map((id) =>
    apiGet(`/fixtures?team=${TEAM_ID}&league=${id}&season=${season}`, key).catch(() => [])
  )
  const [standingsRes, scorersRes, ...fixtureGroups] = await Promise.all([
    apiGet(`/standings?league=${LEAGUES.BSA}&season=${season}`, key),
    apiGet(`/players/topscorers?league=${LEAGUES.BSA}&season=${season}&team=${TEAM_ID}`, key).catch(
      () => []
    ),
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
  const form = recentResults.slice(0, 5).map((r) => r.result).filter(Boolean)

  let table = []
  let stats = null
  const standingBlock = standingsRes?.[0]?.league?.standings?.[0] || []
  table = standingBlock.map((row) => ({
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

  // Top scorers: API may return league-wide; filter Palmeiras if team filter ignored
  let topScorers = (scorersRes || [])
    .filter((p) => !p.statistics?.[0]?.team?.id || p.statistics[0].team.id === TEAM_ID)
    .slice(0, 8)
    .map((p) => ({
      name: p.player.name,
      goals: p.statistics?.[0]?.goals?.total ?? 0,
      assists: p.statistics?.[0]?.goals?.assists ?? 0,
    }))

  if (!topScorers.length && scorersRes?.length) {
    topScorers = scorersRes.slice(0, 5).map((p) => ({
      name: p.player.name,
      goals: p.statistics?.[0]?.goals?.total ?? 0,
      assists: p.statistics?.[0]?.goals?.assists ?? 0,
    }))
  }

  return {
    mode: 'live',
    label: 'Dados ao vivo via API-Football',
    provider: 'api-football',
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
