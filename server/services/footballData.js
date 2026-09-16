/**
 * football-data.org — free tier
 * Competition BSA = Brasileirão
 * Palmeiras team id na BSA costuma ser 1769
 */
import fetch from 'node-fetch'

const BASE = 'https://api.football-data.org/v4'
const BSA = 'BSA'
const TEAM_ID = 1769

function headers(key) {
  return {
    'X-Auth-Token': key,
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
    throw new Error(`football-data.org ${res.status}: ${text.slice(0, 120)}`)
  }
  return res.json()
}

function mapMatch(m, teamId) {
  const isHome = m.homeTeam.id === teamId
  const opponent = isHome ? m.awayTeam.name : m.homeTeam.name
  const finished = m.status === 'FINISHED'
  let score = null
  let result = null
  if (finished && m.score?.fullTime) {
    score = {
      home: m.score.fullTime.home,
      away: m.score.fullTime.away,
    }
    const our = isHome ? score.home : score.away
    const their = isHome ? score.away : score.home
    result = our > their ? 'W' : our < their ? 'L' : 'D'
  }
  return {
    id: String(m.id),
    competition: m.competition?.name || 'Brasileirão Série A',
    competitionCode: m.competition?.code || 'BSA',
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    isHome,
    opponent,
    date: m.utcDate,
    venue: m.venue || (isHome ? 'Allianz Parque' : 'A definir'),
    status: finished ? 'FINISHED' : m.status === 'TIMED' || m.status === 'SCHEDULED' ? 'SCHEDULED' : m.status,
    score,
    result,
  }
}

export async function fetchFromFootballData(key) {
  const [teamMatches, standings, scorers] = await Promise.all([
    apiGet(`/teams/${TEAM_ID}/matches?status=SCHEDULED,FINISHED,TIMED&limit=40`, key),
    apiGet(`/competitions/${BSA}/standings`, key),
    apiGet(`/competitions/${BSA}/scorers?limit=15`, key).catch(() => ({ scorers: [] })),
  ])

  const matches = (teamMatches.matches || []).map((m) => mapMatch(m, TEAM_ID))
  const now = Date.now()
  const upcoming = matches
    .filter((f) => f.status === 'SCHEDULED' && new Date(f.date).getTime() >= now - 3600000)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  const recentResults = matches
    .filter((f) => f.status === 'FINISHED')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)

  const tableRows =
    (standings.standings || []).find((s) => s.type === 'TOTAL')?.table ||
    standings.standings?.[0]?.table ||
    []

  const table = tableRows.map((row) => ({
    position: row.position,
    team: row.team.name,
    played: row.playedGames,
    won: row.won,
    draw: row.draw,
    lost: row.lost,
    gf: row.goalsFor,
    ga: row.goalsAgainst,
    gd: row.goalDifference,
    points: row.points,
    form: (row.form || '').replace(/,/g, ''),
    highlight: row.team.id === TEAM_ID || /palmeiras/i.test(row.team.name),
  }))

  const palmeirasRow = table.find((r) => r.highlight)
  const stats = palmeirasRow
    ? {
        played: palmeirasRow.played,
        won: palmeirasRow.won,
        draw: palmeirasRow.draw,
        lost: palmeirasRow.lost,
        goalsFor: palmeirasRow.gf,
        goalsAgainst: palmeirasRow.ga,
        points: palmeirasRow.points,
        position: palmeirasRow.position,
      }
    : null

  const topScorers = (scorers.scorers || [])
    .filter((s) => s.team?.id === TEAM_ID || /palmeiras/i.test(s.team?.name || ''))
    .slice(0, 8)
    .map((s) => ({
      name: s.player.name,
      goals: s.goals ?? 0,
      assists: s.assists ?? 0,
    }))

  // Se não houver artilheiros só do Palmeiras, mostra top da liga (rotulado no client)
  const scorersFallback =
    topScorers.length > 0
      ? topScorers
      : (scorers.scorers || []).slice(0, 5).map((s) => ({
          name: `${s.player.name} (${s.team?.shortName || s.team?.name || ''})`,
          goals: s.goals ?? 0,
          assists: s.assists ?? 0,
        }))

  return {
    mode: 'live',
    label: 'Dados ao vivo via football-data.org',
    provider: 'football-data',
    updatedAt: new Date().toISOString(),
    team: { id: TEAM_ID, name: 'Palmeiras', shortName: 'PAL' },
    nextMatch: upcoming[0] || null,
    form: recentResults.slice(0, 5).map((r) => r.result).filter(Boolean),
    recentResults,
    upcoming: upcoming.slice(0, 12),
    standings: {
      competition: 'Brasileirão Série A',
      season: String(standings.season?.startDate?.slice(0, 4) || new Date().getFullYear()),
      table,
    },
    stats,
    topScorers: scorersFallback,
  }
}
