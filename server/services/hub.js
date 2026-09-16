import { demoHub } from '../data/fallback.js'
import { getCache, setCache, clearCache } from './cache.js'
import { fetchFromApiFootball } from './apiFootball.js'
import { fetchFromFootballData } from './footballData.js'
import { fetchPalmeirasNews } from './news.js'

function useDemo() {
  return (
    process.env.FORCE_DEMO === 'true' ||
    (!process.env.API_FOOTBALL_KEY && !process.env.FOOTBALL_DATA_API_KEY)
  )
}

export async function buildHubData({ forceRefresh = false } = {}) {
  const ttl = Number(process.env.CACHE_TTL_SECONDS || 120)
  const cacheKey = 'hub:full'

  if (!forceRefresh) {
    const cached = getCache(cacheKey)
    if (cached) return { ...cached, fromCache: true }
  } else {
    clearCache()
  }

  const newsPromise = fetchPalmeirasNews()
  let football
  let footballError = null

  if (useDemo()) {
    football = {
      ...demoHub,
      news: undefined,
      updatedAt: new Date().toISOString(),
    }
  } else {
    try {
      if (process.env.API_FOOTBALL_KEY) {
        football = await fetchFromApiFootball(process.env.API_FOOTBALL_KEY)
      } else if (process.env.FOOTBALL_DATA_API_KEY) {
        football = await fetchFromFootballData(process.env.FOOTBALL_DATA_API_KEY)
      }
    } catch (err) {
      footballError = err.message
      football = {
        ...demoHub,
        mode: 'demo',
        label: `MODO DEMO (falha na API: ${err.message})`,
        updatedAt: new Date().toISOString(),
        news: undefined,
      }
    }
  }

  const newsResult = await newsPromise
  let news = newsResult.news
  if (!news.length) {
    news = demoHub.news.map((n) => ({
      ...n,
      title: n.title.includes('[DEMO]')
        ? n.title
        : `[DEMO] ${n.title}`,
    }))
  }

  const payload = {
    ...football,
    news,
    newsSource: newsResult.source || 'demo',
    newsErrors: newsResult.errors,
    footballError,
    fromCache: false,
    fetchedAt: new Date().toISOString(),
  }

  setCache(cacheKey, payload, ttl)
  return payload
}

export function getDataMode() {
  if (process.env.FORCE_DEMO === 'true') return 'demo-forced'
  if (process.env.API_FOOTBALL_KEY) return 'api-football'
  if (process.env.FOOTBALL_DATA_API_KEY) return 'football-data'
  return 'demo'
}
