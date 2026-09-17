/**
 * YouTube para o próximo jogo — busca pública + feeds de canais oficiais.
 * Nunca inventa que há live; se Premiere/PPV, deixa isso explícito.
 */
import { fetchJson } from './fetchJson.js'

const YT_CHANNELS = [
  {
    id: 'cazetv',
    label: 'CazéTV',
    handle: '@CazeTV',
    url: 'https://www.youtube.com/@CazeTV',
    channelId: 'UCZiYbVptd3PVPf4f6eR6UaQ',
  },
  {
    id: 'palmeiras',
    label: 'Palmeiras',
    handle: '@Palmeiras',
    url: 'https://www.youtube.com/@Palmeiras',
    channelId: 'UCBKc-rPDivvwFiWdG-81wxw',
  },
  {
    id: 'ge',
    label: 'ge',
    handle: '@geglobo',
    url: 'https://www.youtube.com/@geglobo',
    channelId: 'UCS710QGV74b0wPETkrcVB7w',
  },
  {
    id: 'jp-esportes',
    label: 'Jovem Pan Esportes',
    handle: '@jovempanesportes',
    url: 'https://www.youtube.com/@jovempanesportes',
    channelId: 'UCv-Nx8pSfG_LxbViMz14RWQ',
  },
]

function fold(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

function isBrasileirao(match) {
  return (
    match?.competitionCode === 'BSA' ||
    /brasileir|s[eé]rie\s*a/i.test(match?.competition || '')
  )
}

function searchUrl(match) {
  const opp = match?.opponent || ''
  const q = `Palmeiras ${opp} ao vivo`.trim()
  return {
    query: q,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
  }
}

function titleMatchesMatch(title, match) {
  const t = fold(title)
  if (!t.includes('palmeiras')) return false
  const opp = fold(match?.opponent || '')
  if (!opp) return /palmeiras/.test(t)
  // opponent tokens (skip short words)
  const tokens = opp.split(/\s+/).filter((w) => w.length >= 4)
  if (!tokens.length) return t.includes(opp)
  return tokens.some((tok) => t.includes(tok))
}

function scoreTitle(title) {
  const t = fold(title)
  let s = 0
  if (/ao vivo|live|transmiss/.test(t)) s += 5
  if (/melhores momentos|highlights|resumo/.test(t)) s += 2
  if (/jogo completo|integral/.test(t)) s += 3
  if (/premiere|ppv/.test(t)) s -= 1
  return s
}

async function fetchChannelItems(channelId, signal) {
  const rss = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`
  try {
    const json = await fetchJson(url, { signal, timeoutMs: 10000 })
    if (json.status !== 'ok' || !Array.isArray(json.items)) return []
    return json.items.map((it) => ({
      title: it.title || '',
      link: it.link || '',
      pubDate: it.pubDate || '',
    }))
  } catch {
    return []
  }
}

/**
 * @returns {Promise<{
 *   searchUrl: string,
 *   searchQuery: string,
 *   watchUrl: string|null,
 *   watchTitle: string|null,
 *   watchSource: string|null,
 *   channels: typeof YT_CHANNELS,
 *   note: string,
 *   likelyNoLive: boolean,
 *   mode: 'watch'|'search',
 * }>}
 */
export async function resolveYouTube(match, signal) {
  const { query, url: ytSearch } = searchUrl(match)
  const base = {
    searchUrl: ytSearch,
    searchQuery: query,
    watchUrl: null,
    watchTitle: null,
    watchSource: null,
    channels: YT_CHANNELS,
    note: '',
    likelyNoLive: false,
    mode: 'search',
  }
  if (!match) {
    return { ...base, note: 'Sem jogo para buscar no YouTube.' }
  }

  const bsa = isBrasileirao(match)
  // Brasileirão: Premiere PPV é comum — live YT muitas vezes não existe
  base.likelyNoLive = bsa
  base.note = bsa
    ? 'Brasileirão costuma ser Premiere (PPV) e/ou SporTV. Live no YouTube pode não existir para este jogo — use a busca e os canais oficiais.'
    : 'Preferimos link oficial quando achamos vídeo recente nos canais; senão, busca + canais.'

  // Scan recent channel uploads for a relevant video
  let best = null
  for (const ch of YT_CHANNELS) {
    if (signal?.aborted) break
    const items = await fetchChannelItems(ch.channelId, signal)
    for (const it of items) {
      if (!it.link || !titleMatchesMatch(it.title, match)) continue
      const score = scoreTitle(it.title) + (ch.id === 'cazetv' ? 1 : 0)
      if (!best || score > best.score) {
        best = { ...it, source: ch.label, score }
      }
    }
  }

  if (best?.link) {
    return {
      ...base,
      watchUrl: best.link,
      watchTitle: best.title,
      watchSource: best.source,
      mode: 'watch',
      note: bsa
        ? `${base.note} Vídeo encontrado em ${best.source} (pode ser highlights, não live).`
        : `Vídeo recente em ${best.source}. Confirme se é a transmissão desejada.`,
    }
  }

  return base
}

export { YT_CHANNELS }
