import fetch from 'node-fetch'

/**
 * Fontes RSS públicas (ge.globo costuma bloquear alguns egressos; Google News + Gazeta
 * são fallbacks estáveis para manchetes com link ao original).
 */
const RSS_SOURCES = [
  {
    name: 'ge.globo',
    url: 'https://ge.globo.com/rss/futebol/times/palmeiras/',
  },
  {
    name: 'Gazeta Esportiva',
    url: 'https://www.gazetaesportiva.com/times/palmeiras/feed/',
  },
  {
    name: 'Google Notícias',
    url: 'https://news.google.com/rss/search?q=Palmeiras+futebol&hl=pt-BR&gl=BR&ceid=BR:pt-419',
  },
]

function stripCdata(s = '') {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function parseRssItems(xml, sourceName) {
  const items = []
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || []
  for (const block of blocks.slice(0, 12)) {
    const title = stripCdata((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '')
    let link = stripCdata((block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '')
    // Atom-style / Google News sometimes uses <link href="..."/>
    if (!link) {
      const href = (block.match(/<link[^>]+href=["']([^"']+)["']/i) || [])[1]
      if (href) link = href
    }
    const pub =
      stripCdata((block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || '') ||
      stripCdata((block.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i) || [])[1] || '')
    const desc = stripCdata(
      (block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || ''
    )
    if (!title || !link) continue
    // Filtra ruído óbvio se a fonte for genérica
    if (sourceName.startsWith('Google') && !/palmeiras/i.test(title)) continue
    let publishedAt
    try {
      publishedAt = pub ? new Date(pub).toISOString() : new Date().toISOString()
      if (Number.isNaN(Date.parse(publishedAt))) publishedAt = new Date().toISOString()
    } catch {
      publishedAt = new Date().toISOString()
    }
    items.push({
      id: `rss-${Buffer.from(link).toString('base64url').slice(0, 24)}`,
      title,
      source: sourceName,
      publishedAt,
      url: link,
      summary: desc.slice(0, 220),
    })
  }
  return items
}

export async function fetchPalmeirasNews() {
  const errors = []
  for (const src of RSS_SOURCES) {
    try {
      const res = await fetch(src.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; PalmeirasHub/1.0; +https://github.com/guilhermeromio-netto-prog/palmeiras-hub)',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        timeout: 12000,
      })
      if (!res.ok) {
        errors.push(`${src.name}: HTTP ${res.status}`)
        continue
      }
      const xml = await res.text()
      const items = parseRssItems(xml, src.name)
      if (items.length) {
        return { news: items, source: src.name, errors }
      }
      errors.push(`${src.name}: RSS vazio`)
    } catch (err) {
      errors.push(`${src.name}: ${err.message}`)
    }
  }
  return { news: [], source: null, errors }
}
