/**
 * Desfalques / lesões / suspensões — só o que as fontes públicas trazem.
 * Nunca inventa; empty state honesto.
 */

const NEWS_RE =
  /\b(les[aã]o|lesionado|lesionada|desfalque|desfalques|suspens[oa]|suspensos|fora do (próximo|proximo)|n[aã]o joga|cortado|medico|médico|departamento m[eé]dico)\b/i

/**
 * Extrai sinais de disponibilidade do elenco ESPN.
 * @param {object[]} squad
 */
export function fromRoster(squad = []) {
  const injuries = []
  const suspended = []

  for (const p of squad) {
    const name = p.name || p.shortName
    if (!name) continue

    const statusType = String(p.statusType || p.status || '').toLowerCase()
    const statusAbbr = String(p.statusAbbr || '').toLowerCase()

    if (/suspen/i.test(statusType) || /suspen/i.test(statusAbbr)) {
      suspended.push({
        id: p.id,
        name,
        jersey: p.jersey,
        kind: 'suspended',
        detail: p.statusLabel || 'Suspenso (status ESPN)',
        source: 'ESPN elenco',
      })
    } else if (
      statusType &&
      statusType !== 'active' &&
      statusAbbr !== 'active' &&
      statusType !== 'a'
    ) {
      injuries.push({
        id: p.id,
        name,
        jersey: p.jersey,
        kind: 'unavailable',
        detail: p.statusLabel || p.statusType || 'Indisponível (status ESPN)',
        source: 'ESPN elenco',
      })
    }

    for (const inj of p.injuries || []) {
      injuries.push({
        id: p.id,
        name,
        jersey: p.jersey,
        kind: 'injury',
        detail:
          inj.detail ||
          inj.status ||
          inj.type ||
          'Lesão listada na ESPN',
        source: 'ESPN elenco',
      })
    }
  }

  return { injuries, suspended }
}

/**
 * Manchetes que citam desfalque/lesão/suspensão (sinal fraco — rotulado como notícia).
 * @param {object[]} news
 */
export function fromNews(news = []) {
  const hits = []
  const seen = new Set()
  for (const n of news || []) {
    const title = n.title || ''
    const blurb = n.description || n.summary || ''
    if (!NEWS_RE.test(title) && !NEWS_RE.test(blurb)) continue
    const key = title.slice(0, 80)
    if (seen.has(key)) continue
    seen.add(key)
    hits.push({
      id: n.id || n.url || key,
      name: null,
      kind: 'news',
      detail: title,
      source: n.source || 'Notícias',
      url: n.url || n.link || null,
    })
  }
  return hits.slice(0, 5)
}

/**
 * @param {{ squad?: object[], news?: object[] }} data
 */
export function buildAvailability(data = {}) {
  const { injuries, suspended } = fromRoster(data.squad || [])
  const newsHits = fromNews(data.news || [])
  const items = [...suspended, ...injuries, ...newsHits]
  return {
    items,
    injuries,
    suspended,
    newsHits,
    empty: items.length === 0,
  }
}
