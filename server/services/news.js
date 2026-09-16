import fetch from 'node-fetch'

const RSS_SOURCES = [
  {
    name: 'ge.globo',
    url: 'https://ge.globo.com/rss/futebol/times/palmeiras/',
  },
  {
    name: 'ge.globo (alt)',
    url: 'https://ge.globo.com/dynamo/futebol/times/palmeiras/rss2.xml',
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
    .trim()
}

function parseRssItems(xml, sourceName) {
  const items = []
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || []
  for (const block of blocks.slice(0, 12)) {
    const title = stripCdata((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '')
    const link = stripCdata((block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '')
    const pub =
      stripCdata((block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || '') ||
      stripCdata((block.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i) || [])[1] || '')
    const desc = stripCdata(
      (block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || ''
    )
    if (!title || !link) continue
    items.push({
      id: `rss-${Buffer.from(link).toString('base64url').slice(0, 24)}`,
      title,
      source: sourceName,
      publishedAt: pub ? new Date(pub).toISOString() : new Date().toISOString(),
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
          'User-Agent': 'PalmeirasHub/1.0 (+fan-app; contact: local)',
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
