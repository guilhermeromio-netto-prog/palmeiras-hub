/**
 * Proxy opcional same-origin (CORS) + static em produção.
 * O app NÃO depende deste servidor: o Vite/static fetcha fontes públicas direto.
 *
 * Uso: npm run dev:proxy  →  http://localhost:3001/api/proxy?url=...
 */
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const isProd = process.env.NODE_ENV === 'production'
const PORT = Number(process.env.PORT || 3001)

const ALLOWED_HOSTS = new Set([
  'site.api.espn.com',
  'www.thesportsdb.com',
  'api.rss2json.com',
  'pt.wikipedia.org',
  'en.wikipedia.org',
  'api.allorigins.win',
  'news.google.com',
  'www.gazetaesportiva.com',
  'ge.globo.com',
])

const app = express()
app.use(cors())

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    role: 'optional-proxy',
    time: new Date().toISOString(),
    tz: 'America/Sao_Paulo',
    note: 'App principal funciona sem este servidor (fontes públicas no browser).',
  })
})

app.get('/api/proxy', async (req, res) => {
  try {
    const target = req.query.url
    if (!target || typeof target !== 'string') {
      return res.status(400).json({ error: true, message: 'Informe ?url=' })
    }
    let parsed
    try {
      parsed = new URL(target)
    } catch {
      return res.status(400).json({ error: true, message: 'URL inválida' })
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: true, message: 'Protocolo não permitido' })
    }
    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      return res.status(403).json({
        error: true,
        message: `Host não permitido no proxy: ${parsed.hostname}`,
      })
    }

    const upstream = await fetch(target, {
      headers: {
        Accept: req.headers.accept || '*/*',
        'User-Agent': 'PalmeirasHub/1.0 (optional-proxy)',
      },
      signal: AbortSignal.timeout(20000),
    })
    const ct = upstream.headers.get('content-type') || 'application/octet-stream'
    const buf = Buffer.from(await upstream.arrayBuffer())
    res.status(upstream.status)
    res.setHeader('Content-Type', ct)
    res.setHeader('Cache-Control', 'no-store')
    res.send(buf)
  } catch (err) {
    console.error('[proxy]', err.message)
    res.status(502).json({ error: true, message: err.message })
  }
})

if (isProd) {
  const dist = path.join(root, 'dist')
  app.use(express.static(dist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`🌿 Palmeiras Hub proxy opcional em http://localhost:${PORT}`)
  console.log('   /api/health  /api/proxy?url=...')
  if (isProd) console.log('   Servindo dist/')
})
