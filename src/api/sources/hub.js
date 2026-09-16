/**
 * Agrega fontes públicas a cada abertura do app.
 * Nunca inventa placares / escalações / cartões — se falhar, devolve vazio/erro parcial.
 */
import {
  fetchEspnMatches,
  fetchEspnAllStandings,
  fetchEspnRoster,
  fetchEspnLineup,
} from './espn.js'
import { fetchSportsDbNextLast } from './sportsdb.js'
import { fetchPalmeirasNews } from './news.js'
import { fetchWikiScorers } from './wikipedia.js'

function mergeUpcoming(primary, extra) {
  const map = new Map()
  const keyOf = (m) =>
    `${(m.date || '').slice(0, 16)}|${(m.homeTeam || '').toLowerCase()}|${(m.awayTeam || '').toLowerCase()}`
  for (const m of [...(primary || []), ...(extra || [])]) {
    if (!m?.date) continue
    const k = keyOf(m)
    if (!map.has(k)) map.set(k, m)
  }
  const now = Date.now() - 60 * 60 * 1000
  return [...map.values()]
    .filter((m) => m.status === 'SCHEDULED' && new Date(m.date).getTime() >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

function mergeResults(primary, extra) {
  const map = new Map()
  const keyOf = (m) =>
    `${(m.date || '').slice(0, 16)}|${(m.homeTeam || '').toLowerCase()}|${(m.awayTeam || '').toLowerCase()}`
  for (const m of [...(primary || []), ...(extra || [])]) {
    if (!m) continue
    const k = keyOf(m)
    if (!map.has(k)) map.set(k, m)
  }
  return [...map.values()]
    .filter((m) => m.status === 'FINISHED')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 16)
}

function formatTimeLabel(iso) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export async function buildHubFromPublicSources({ signal } = {}) {
  const fetchedAt = new Date().toISOString()
  const errors = []
  const sourcesUsed = []

  const [standingsRes, matchesRes, sportsDbRes, newsRes, scorersRes, rosterRes] =
    await Promise.all([
      fetchEspnAllStandings(signal)
        .then((r) => {
          sourcesUsed.push(r.source)
          if (r.errors?.length) errors.push(...r.errors.map((e) => `Tabela: ${e}`))
          return r
        })
        .catch((err) => {
          errors.push(`Classificação: ${err.message}`)
          return null
        }),
      fetchEspnMatches(signal)
        .then((r) => {
          sourcesUsed.push(r.source)
          if (r.errors?.length) errors.push(...r.errors)
          return r
        })
        .catch((err) => {
          errors.push(`Jogos ESPN: ${err.message}`)
          return null
        }),
      fetchSportsDbNextLast(signal)
        .then((r) => {
          sourcesUsed.push(r.source)
          return r
        })
        .catch((err) => {
          errors.push(`TheSportsDB: ${err.message}`)
          return null
        }),
      fetchPalmeirasNews(signal)
        .then((r) => {
          if (r.source) sourcesUsed.push(`RSS (${r.source})`)
          if (r.errors?.length) errors.push(...r.errors.map((e) => `Notícias: ${e}`))
          return r
        })
        .catch((err) => {
          errors.push(`Notícias: ${err.message}`)
          return { news: [], source: null, errors: [err.message] }
        }),
      fetchWikiScorers(signal)
        .then((r) => {
          sourcesUsed.push(r.source)
          return r
        })
        .catch((err) => {
          errors.push(`Artilharia: ${err.message}`)
          return null
        }),
      fetchEspnRoster(signal)
        .then((r) => {
          sourcesUsed.push(r.source)
          return r
        })
        .catch((err) => {
          errors.push(`Elenco: ${err.message}`)
          return null
        }),
    ])

  const upcoming = mergeUpcoming(matchesRes?.upcoming, sportsDbRes?.next)
  const recentResults = mergeResults(matchesRes?.recentResults, sportsDbRes?.last)
  const nextMatch = upcoming[0] || null
  const form =
    matchesRes?.form?.length > 0
      ? matchesRes.form
      : recentResults
          .slice(0, 5)
          .map((r) => r.result)
          .filter(Boolean)

  // Lineup depends on match ids — fetch after matches
  let lineupRes = null
  try {
    lineupRes = await fetchEspnLineup(signal, matchesRes?.allMatches || recentResults)
    if (lineupRes?.source) sourcesUsed.push(lineupRes.source)
    if (lineupRes?.errors?.length && !lineupRes.lineup) {
      errors.push(...lineupRes.errors.slice(0, 2).map((e) => `Escalação: ${e}`))
    }
  } catch (err) {
    errors.push(`Escalação: ${err.message}`)
  }

  const hasFootball =
    Boolean(standingsRes?.standings?.table?.length) ||
    Boolean(standingsRes?.competitions?.length) ||
    recentResults.length > 0 ||
    upcoming.length > 0 ||
    Boolean(rosterRes?.squad?.length)
  const hasNews = (newsRes?.news || []).length > 0

  if (!hasFootball && !hasNews) {
    const err = new Error(
      errors.length
        ? `Todas as fontes falharam. ${errors.slice(0, 3).join(' · ')}`
        : 'Nenhuma fonte pública respondeu.'
    )
    err.partial = { fetchedAt, errors }
    throw err
  }

  const timeLabel = formatTimeLabel(fetchedAt)
  const uniqueSources = [...new Set(sourcesUsed)]
  const mode = errors.length && (!hasFootball || !hasNews) ? 'partial' : 'live'
  const label =
    mode === 'partial'
      ? `Dados parciais · fontes públicas · Atualizado às ${timeLabel}`
      : `Fontes públicas · Atualizado às ${timeLabel}`

  return {
    mode,
    label,
    provider: uniqueSources.join(' + ') || 'público',
    sources: uniqueSources,
    updatedAt: fetchedAt,
    fetchedAt,
    updatedAtLabel: timeLabel,
    team: { id: 'palmeiras', name: 'Palmeiras', shortName: 'PAL' },
    nextMatch,
    form,
    recentResults,
    upcoming,
    standings: standingsRes?.standings || {
      competition: 'Brasileirão Série A',
      season: String(new Date().getFullYear()),
      table: [],
    },
    competitions: standingsRes?.competitions || [],
    stats: standingsRes?.stats || null,
    topScorers: scorersRes?.topScorers || [],
    squad: rosterRes?.squad || [],
    squadByPosition: rosterRes?.byPosition || { G: [], D: [], M: [], F: [] },
    cards: rosterRes?.cards || [],
    cardsSeason: rosterRes?.cardsSeason || null,
    cardsCompetition: rosterRes?.cardsCompetition || null,
    lineup: lineupRes?.lineup || null,
    news: newsRes?.news || [],
    newsSource: newsRes?.source || null,
    newsErrors: newsRes?.errors || [],
    errors,
    fromCache: false,
  }
}
