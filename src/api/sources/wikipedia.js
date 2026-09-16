/**
 * Wikipedia (pt) — CORS via origin=*. Artilharia do Brasileirão.
 */
import { fetchJson } from './fetchJson.js'

function strip(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&#91;\d+&#93;/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function fetchWikiScorers(signal) {
  const year = new Date().getFullYear()
  const page = `Campeonato_Brasileiro_de_Futebol_de_${year}_-_Série_A`
  const url =
    `https://pt.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(page)}` +
    `&prop=text&format=json&origin=*`

  const json = await fetchJson(url, { signal, timeoutMs: 20000 })
  const html = json.parse?.text?.['*']
  if (!html) throw new Error('Wikipedia sem HTML')

  const tables = [
    ...html.matchAll(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/gi),
  ]
  const scorers = []

  for (const t of tables) {
    const tableHtml = t[0]
    const rows = [...tableHtml.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((r) => r[0])
    if (!rows.length) continue
    const header = strip(rows[0])
    // Prefer the goals table (not assists / clean sheets)
    if (!/\bGols\b/i.test(header) || !/Jogador/i.test(header)) continue
    if (/Assists|Assistências|Jogos|D\b.*CS/i.test(header) && !/\bGols\b/i.test(header)) continue

    let lastPos = null
    let lastPlayer = null
    for (const row of rows.slice(1)) {
      const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) =>
        strip(c[1])
      )
      if (!cells.length) continue

      let pos
      let name
      let team
      let goals

      if (/^\d+$/.test(cells[0])) {
        pos = cells[0]
        name = cells[1]
        team = cells[2]
        goals = parseInt(cells[3], 10)
        lastPos = pos
        lastPlayer = name
      } else if (cells.length >= 3 && /^\d+$/.test(cells[cells.length - 1] || '')) {
        // rowspan: player name omitted, team + goals
        name = lastPlayer || cells[0]
        team = cells.length === 2 ? cells[0] : cells[1] || cells[0]
        goals = parseInt(cells[cells.length - 1], 10)
        if (cells.length >= 3 && !/^\d+$/.test(cells[0])) {
          name = cells[0]
          team = cells[1]
        }
      } else {
        continue
      }

      if (!name || !Number.isFinite(goals)) continue
      scorers.push({ name, team, goals, assists: null, pos: pos || lastPos })
    }
    if (scorers.length >= 5) break
  }

  const unique = []
  const seen = new Set()
  for (const s of scorers) {
    const k = `${s.name}|${s.team}|${s.goals}`
    if (seen.has(k)) continue
    seen.add(k)
    unique.push(s)
  }

  const palmeiras = unique.filter((s) => /palmeiras/i.test(s.team || ''))
  const topScorers = (palmeiras.length >= 3 ? palmeiras : unique).slice(0, 10)

  return {
    topScorers,
    source: palmeiras.length >= 3 ? 'Wikipedia (artilharia Palmeiras)' : 'Wikipedia (artilharia Brasileirão)',
  }
}
