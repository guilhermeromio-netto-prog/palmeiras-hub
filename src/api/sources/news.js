/**
 * Notícias via rss2json (CORS *) — fontes RSS públicas brasileiras.
 * Agrega feeds (dedupe) para ticker + aba Notícias.
 */
import { fetchJson } from './fetchJson.js'

const FEEDS = [
  {
    name: 'Gazeta Esportiva',
    rss: 'https://www.gazetaesportiva.com/times/palmeiras/feed/',
  },
  {
    name: 'Google Notícias',
    rss: 'https://news.google.com/rss/search?q=Palmeiras+futebol&hl=pt-BR&gl=BR&ceid=BR:pt-419',
  },
  {
    name: 'ge.globo',
    rss: 'https://ge.globo.com/rss/futebol/times/palmeiras/',
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

function mapItems(feed, items) {
  return (items || []).slice(0, 10).map((item) => ({
    id: idFrom(item.link, item.title),
    title: item.title,
    source: feed.name,
    publishedAt: toIso(item.pubDate),
    url: item.link,
    summary: (item.description || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 220),
  }))
}

export async function fetchPalmeirasNews(signal) {
  const errors = []
  const byId = new Map()
  const sourcesOk = []

  await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.rss)}`
        const json = await fetchJson(url, { signal, timeoutMs: 16000 })
        if (json.status !== 'ok' || !Array.isArray(json.items) || !json.items.length) {
          errors.push(`${feed.name}: feed vazio`)
          return
        }
        sourcesOk.push(feed.name)
        for (const item of mapItems(feed, json.items)) {
          if (!byId.has(item.id)) byId.set(item.id, item)
        }
      } catch (err) {
        errors.push(`${feed.name}: ${err.message}`)
      }
    })
  )

  const news = [...byId.values()].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  )

  return {
    news: news.slice(0, 24),
    source: sourcesOk.join(' + ') || null,
    errors,
  }
}
