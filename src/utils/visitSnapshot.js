/**
 * Snapshot da visita anterior — “Desde a última vez”.
 */

import { matchDedupeKey } from './matchKey.js'

const VISIT_KEY = 'palmeiras-hub-visit-snapshot-v1'

export function readVisitSnapshot() {
  try {
    const raw = localStorage.getItem(VISIT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function writeVisitSnapshot(snapshot) {
  try {
    localStorage.setItem(VISIT_KEY, JSON.stringify(snapshot))
  } catch {
    /* ignore */
  }
}

export function buildVisitSnapshot(data) {
  const position = data?.stats?.position ?? null
  const points = data?.stats?.points ?? null
  const recent = (data?.recentResults || []).slice(0, 8).map((m) => ({
    key: matchDedupeKey(m) || m.id,
    title: `${m.homeTeam || 'Palmeiras'} × ${m.awayTeam || m.opponent || '?'}`,
    score:
      m.score != null ? `${m.score.home}×${m.score.away}` : null,
    result: m.result || null,
    date: m.date,
  }))
  const headlines = (data?.news || []).slice(0, 10).map((n) => ({
    id: n.id,
    title: n.title,
    source: n.source,
  }))
  return {
    visitedAt: new Date().toISOString(),
    position,
    points,
    recentKeys: recent.map((r) => r.key),
    recent,
    newsIds: headlines.map((h) => h.id),
    headlines,
  }
}

/**
 * Compara dados atuais com o snapshot da visita anterior.
 * Retorna null se não houver delta relevante ou primeira visita.
 */
export function computeVisitDelta(data, prev) {
  if (!prev || !data) return null
  const items = []

  const curPos = data?.stats?.position
  if (
    prev.position != null &&
    curPos != null &&
    Number(prev.position) !== Number(curPos)
  ) {
    const delta = Number(prev.position) - Number(curPos)
    items.push({
      type: 'position',
      text:
        delta > 0
          ? `Subiu ${delta} posição(ões) no Brasileirão: ${prev.position}º → ${curPos}º`
          : `Desceu ${Math.abs(delta)} posição(ões) no Brasileirão: ${prev.position}º → ${curPos}º`,
      tone: delta > 0 ? 'up' : 'down',
    })
  } else if (
    prev.points != null &&
    data?.stats?.points != null &&
    Number(prev.points) !== Number(data.stats.points)
  ) {
    const dp = Number(data.stats.points) - Number(prev.points)
    items.push({
      type: 'points',
      text: `Pontos no Brasileirão: ${prev.points} → ${data.stats.points} (${dp >= 0 ? '+' : ''}${dp})`,
      tone: dp >= 0 ? 'up' : 'down',
    })
  }

  const prevKeys = new Set(prev.recentKeys || [])
  const newResults = (data.recentResults || [])
    .filter((m) => {
      const k = matchDedupeKey(m) || m.id
      return k && !prevKeys.has(k)
    })
    .slice(0, 4)
  for (const m of newResults) {
    const score =
      m.score != null ? `${m.score.home}×${m.score.away}` : 'placar n/d'
    items.push({
      type: 'result',
      text: `Novo resultado: ${m.homeTeam || 'Palmeiras'} × ${m.awayTeam || m.opponent} (${score})`,
      tone: m.result === 'W' ? 'up' : m.result === 'L' ? 'down' : 'same',
    })
  }

  const prevNews = new Set(prev.newsIds || [])
  const newHeadlines = (data.news || []).filter((n) => n.id && !prevNews.has(n.id)).slice(0, 3)
  for (const n of newHeadlines) {
    items.push({
      type: 'news',
      text: `Nova manchete: ${n.title}`,
      tone: 'same',
      url: n.url,
    })
  }

  if (!items.length) return null
  return {
    visitedAt: prev.visitedAt,
    items,
  }
}
