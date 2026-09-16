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
import { fetchHeadToHead } from './h2h.js'
import { mergeMatchesByKey } from '../../utils/matchKey.js'
import { applyStandingsMovement } from '../../utils/standingsMovement.js'
import { dateKeySP } from '../../utils/datetime.js'

function mergeUpcoming(primary, extra) {
  const now = Date.now() - 60 * 60 * 1000
  const today = dateKeySP(new Date())
  return mergeMatchesByKey(primary, extra)
    .filter((m) => {
      if (!m || m.status === 'FINISHED') return false
      // LIVE: mantém identidade do jogo do dia (polling ao vivo fica no hook useLiveMatch)
      if (m.status === 'LIVE') return true
      if (m.status !== 'SCHEDULED') return false
      const t = new Date(m.date).getTime()
      if (Number.isNaN(t)) return false
      if (t >= now) return true
      // Já passou o apito, mas ainda é hoje (SP): countdown → "em andamento"
      return dateKeySP(m.date) === today
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

function mergeResults(primary, extra) {
  return mergeMatchesByKey(primary, extra)
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

  let h2h = { opponent: null, meetings: [], source: null }
  if (nextMatch?.opponent) {
    try {
      const localPool = mergeMatchesByKey(matchesRes?.allMatches || [], recentResults)
      h2h = await fetchHeadToHead({
        opponent: nextMatch.opponent,
        localMatches: localPool,
        signal,
      })
      if (h2h.source) sourcesUsed.push(`H2H (${h2h.source})`)
    } catch (err) {
      errors.push(`H2H: ${err.message}`)
    }
  }

  const rawCompetitions = standingsRes?.competitions || []
  const competitions = applyStandingsMovement(rawCompetitions)

  const bsa = competitions.find((c) => c.competitionCode === 'BSA')
  const standings = bsa
    ? { competition: bsa.competition, season: bsa.season, table: bsa.table }
    : standingsRes?.standings || {
        competition: 'Brasileirão Série A',
        season: String(new Date().getFullYear()),
        table: [],
      }

  const hasFootball =
    Boolean(standings?.table?.length) ||
    Boolean(competitions.length) ||
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
    standings,
    competitions,
    stats: standingsRes?.stats || null,
    topScorers: scorersRes?.topScorers || [],
    squad: rosterRes?.squad || [],
    squadByPosition: rosterRes?.byPosition || { G: [], D: [], M: [], F: [] },
    cards: rosterRes?.cards || [],
    cardsSeason: rosterRes?.cardsSeason || null,
    cardsCompetition: rosterRes?.cardsCompetition || null,
    lineup: lineupRes?.lineup || null,
    h2h,
    news: newsRes?.news || [],
    newsSource: newsRes?.source || null,
    newsErrors: newsRes?.errors || [],
    errors,
    fromCache: false,
    movementNote:
      'Setas: ESPN rankChange quando disponível; senão, comparação com a visita anterior (localStorage).',
  }
}
