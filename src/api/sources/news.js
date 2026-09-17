/**
 * Notícias via rss2json (CORS *) — fontes RSS públicas brasileiras.
 * Agrega feeds (dedupe por título normalizado) para ticker + aba Notícias.
 * Fallback: allorigins quando rss2json falha em um feed.
 */
import { fetchJson, fetchText } from './fetchJson.js'

const FEEDS = [
  {
    name: 'Gazeta Esportiva',
    rss: 'https://www.gazetaesportiva.com/times/palmeiras/feed/',
    requirePalmeiras: false,
  },
  {
    name: 'Google Notícias',
    rss: 'https://news.google.com/rss/search?q=Palmeiras+futebol&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    requirePalmeiras: false,
  },
  {
    name: 'ge.globo',
    // pox.globo responde melhor que ge.globo.com/rss (muitos proxies 400/422)
    rss: 'https://pox.globo.com/rss/ge/futebol/times/palmeiras/',
    requirePalmeiras: false,
  },
  {
    name: 'UOL Esporte',
    rss: 'https://rss.uol.com.br/feed/esporte.xml',
    requirePalmeiras: true,
  },
  {
    name: 'CNN Brasil',
    rss: 'https://news.google.com/rss/search?q=Palmeiras+(site:cnnbrasil.com.br)&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    requirePalmeiras: false,
    labelAs: 'CNN Brasil',
  },
  {
    name: 'Lance!',
    rss: 'https://news.google.com/rss/search?q=Palmeiras+(site:lance.com.br+OR+Lance)&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    requirePalmeiras: false,
    labelAs: 'Lance!',
  },
]

function toIso(pub) {
  try {
    const d = new Date(pub)
    if (Number.isNaN(d.getTime())) return new Date().toISOString()
    return d.toISOString()
  } catch {
    return new Date().toISOString()
  }
}

function idFrom(url, title) {
  const raw = url || title || Math.random().toString(36)
  let h = 0
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) >>> 0
  return `news-${h.toString(36)}`
}

function normalizeTitle(title) {
  return String(title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
}

function mentionsPalmeiras(item) {
  const blob = `${item.title || ''} ${item.description || ''} ${item.link || ''}`
  return /palmeiras/i.test(blob)
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function mapItems(feed, items) {
  const sourceName = feed.labelAs || feed.name
  return (items || [])
    .filter((item) => item?.title)
    .filter((item) => (feed.requirePalmeiras ? mentionsPalmeiras(item) : true))
    .slice(0, 16)
    .map((item) => ({
      id: idFrom(item.link || item.guid, item.title),
      title: String(item.title).replace(/\s+/g, ' ').trim(),
      source: sourceName,
      publishedAt: toIso(item.pubDate || item.published || item.updated),
      url: item.link || item.guid || '#',
      summary: stripHtml(item.description || item.content || '').slice(0, 220),
      _norm: normalizeTitle(item.title),
    }))
}

function parseRssXml(xml, feed) {
  // Minimal RSS item parse (title/link/pubDate/description)
  const items = []
  const chunks = String(xml || '').split(/<item[\s>]/i).slice(1)
  for (const chunk of chunks.slice(0, 18)) {
    const get = (tag) => {
      const cdata = chunk.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
      if (cdata) return cdata[1].trim()
      const plain = chunk.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
      return plain ? plain[1].trim() : ''
    }
    const title = stripHtml(get('title'))
    const link = stripHtml(get('link') || get('guid'))
    const pubDate = stripHtml(get('pubDate') || get('dc:date'))
    const description = get('description') || get('content:encoded')
    if (!title) continue
    items.push({ title, link, pubDate, description })
  }
  return mapItems(feed, items)
}

async function fetchFeedViaRss2Json(feed, signal) {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.rss)}`
  const json = await fetchJson(url, { signal, timeoutMs: 16000 })
  if (json.status !== 'ok' || !Array.isArray(json.items) || !json.items.length) {
    throw new Error('feed vazio')
  }
  return mapItems(feed, json.items)
}

async function fetchFeedViaAllOrigins(feed, signal) {
  const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.rss)}`
  const xml = await fetchText(proxied, { signal, timeoutMs: 18000 })
  const mapped = parseRssXml(xml, feed)
  if (!mapped.length) throw new Error('XML sem itens')
  return mapped
}

async function loadFeed(feed, signal) {
  try {
    return { items: await fetchFeedViaRss2Json(feed, signal), via: 'rss2json' }
  } catch (err1) {
    try {
      return { items: await fetchFeedViaAllOrigins(feed, signal), via: 'allorigins' }
    } catch (err2) {
      throw new Error(`${err1.message}; fallback: ${err2.message}`)
    }
  }
}

export async function fetchPalmeirasNews(signal) {
  const errors = []
  const byNorm = new Map()
  const sourcesOk = []

  await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const { items } = await loadFeed(feed, signal)
        if (!items.length) {
          errors.push(`${feed.name}: sem itens após filtro`)
          return
        }
        sourcesOk.push(feed.labelAs || feed.name)
        for (const item of items) {
          const prev = byNorm.get(item._norm)
          if (!prev) {
            byNorm.set(item._norm, item)
            continue
          }
          // Prefer more recent; keep first source label if same time
          if (new Date(item.publishedAt) > new Date(prev.publishedAt)) {
            byNorm.set(item._norm, item)
          }
        }
      } catch (err) {
        errors.push(`${feed.name}: ${err.message}`)
      }
    })
  )

  const news = [...byNorm.values()]
    .map(({ _norm, ...rest }) => rest)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

  return {
    news: news.slice(0, 40),
    source: sourcesOk.join(' + ') || null,
    errors,
  }
}
