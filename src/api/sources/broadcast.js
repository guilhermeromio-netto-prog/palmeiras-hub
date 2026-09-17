/**
 * Onde assistir — mapa por competição + tentativa de confirmar via Google News RSS.
 * Nunca inventa canal específico sem evidência; se incerto → "a confirmar".
 */
import { fetchJson } from './fetchJson.js'

const KNOWN_CHANNELS = [
  { id: 'paramount', label: 'Paramount+', re: /paramount\+?/i },
  { id: 'premiere', label: 'Premiere', re: /\bpremiere\b/i },
  { id: 'sportv', label: 'SporTV', re: /\bsportv\b/i },
  { id: 'globo', label: 'TV Globo', re: /\b(tv\s*)?globo\b/i },
  { id: 'cazetv', label: 'CazeTV', re: /\bcazetv\b/i },
  { id: 'youtube', label: 'YouTube', re: /\byoutube\b/i },
  { id: 'amazon', label: 'Amazon Prime', re: /\b(amazon|prime\s*video)\b/i },
  { id: 'disney', label: 'Disney+', re: /\bdisney\+?/i },
  { id: 'espn', label: 'ESPN', re: /\bespn\b/i },
]

/** Canais típicos por competição (BR) — rotulados como típico, não confirmação da rodada. */
const TYPICAL_BY_COMP = [
  {
    test: (m) =>
      m?.competitionCode === 'LIB' || /libertadores/i.test(m?.competition || ''),
    channels: ['Paramount+'],
    note: 'Libertadores no Brasil costuma ser Paramount+.',
  },
  {
    test: (m) =>
      m?.competitionCode === 'BSA' || /brasileir|s[eé]rie\s*a/i.test(m?.competition || ''),
    channels: ['Premiere', 'SporTV'],
    note: 'Brasileirão: Premiere (PPV) e/ou SporTV — varia por rodada/estado.',
  },
  {
    test: (m) =>
      m?.competitionCode === 'CDB' || /copa do brasil/i.test(m?.competition || ''),
    channels: ['TV Globo', 'SporTV', 'Premiere'],
    note: 'Copa do Brasil: tipicamente Globo e/ou SporTV/Premiere conforme fase e praça — confirme na imprensa.',
  },
  {
    test: (m) =>
      m?.competitionCode === 'PAU' || /paulista|paulist[aã]o/i.test(m?.competition || ''),
    channels: ['Record', 'streaming da Federação'],
    note: 'Paulistão muda conforme fase e direitos da temporada.',
  },
]

function searchUrl(match) {
  const opp = match?.opponent || ''
  const comp = match?.competition || 'Palmeiras'
  const q = `onde assistir Palmeiras ${opp} ${comp}`.trim()
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`
}

function extractChannelsFromText(text) {
  const found = []
  const seen = new Set()
  for (const ch of KNOWN_CHANNELS) {
    if (ch.re.test(text) && !seen.has(ch.id)) {
      seen.add(ch.id)
      found.push(ch.label)
    }
  }
  return found
}

function typicalFor(match) {
  for (const row of TYPICAL_BY_COMP) {
    if (row.test(match)) {
      return {
        channels: row.channels,
        note: row.note,
        confidence: row.channels.length ? 'typical' : 'unknown',
      }
    }
  }
  return { channels: [], note: '', confidence: 'unknown' }
}

/**
 * Busca manchetes "onde assistir" no Google News RSS (via rss2json).
 * Só aceita canais citados explicitamente no título/resumo.
 */
async function fetchPressChannels(match, signal) {
  const opp = match?.opponent || ''
  const q = `onde assistir Palmeiras ${opp}`.trim()
  const rss = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`
  try {
    const json = await fetchJson(url, { signal, timeoutMs: 12000 })
    if (json.status !== 'ok' || !Array.isArray(json.items)) return null
    const blob = json.items
      .slice(0, 8)
      .map((it) => `${it.title || ''} ${it.description || ''}`)
      .join(' \n ')
    const channels = extractChannelsFromText(blob)
    const sourceItem = json.items.find((it) =>
      /onde assistir|transa?miss[aã]o|paramount|premiere|sportv/i.test(
        `${it.title || ''} ${it.description || ''}`
      )
    )
    if (!channels.length) return null
    return {
      channels,
      confidence: 'press',
      sourceLabel: sourceItem?.title ? 'Imprensa (Google Notícias)' : 'Google Notícias',
      sourceUrl: sourceItem?.link || null,
      note: 'Canais citados em manchetes recentes — confira o link.',
    }
  } catch {
    return null
  }
}

/**
 * @returns {Promise<{
 *   channels: string[],
 *   confidence: 'press'|'typical'|'unknown',
 *   note: string,
 *   sourceLabel?: string,
 *   sourceUrl?: string|null,
 *   searchUrl: string,
 * }>}
 */
export async function resolveBroadcast(match, signal) {
  const base = {
    searchUrl: searchUrl(match),
    channels: [],
    confidence: 'unknown',
    note: 'Transmissão a confirmar.',
  }
  if (!match) return base

  const press = await fetchPressChannels(match, signal)
  if (press?.channels?.length) {
    return { ...base, ...press, searchUrl: base.searchUrl }
  }

  const typical = typicalFor(match)
  if (typical.channels.length) {
    return {
      ...base,
      channels: typical.channels,
      confidence: 'typical',
      note: `${typical.note} Confirme na imprensa se a rodada mudou.`,
      sourceLabel: 'Mapa típico da competição',
    }
  }

  return {
    ...base,
    note: typical.note || 'Ainda sem canal confirmado nas fontes públicas.',
    confidence: 'unknown',
  }
}
