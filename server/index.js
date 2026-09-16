import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { buildHubData, getDataMode } from './services/hub.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const isProd = process.env.NODE_ENV === 'production'
const PORT = Number(process.env.PORT || 3001)

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    mode: getDataMode(),
    time: new Date().toISOString(),
    tz: 'America/Sao_Paulo',
  })
})

app.get('/api/hub', async (req, res) => {
  try {
    const force = req.query.refresh === '1' || req.query.refresh === 'true'
    const data = await buildHubData({ forceRefresh: force })
    res.json(data)
  } catch (err) {
    console.error('[api/hub]', err)
    res.status(502).json({
      error: true,
      message: 'Falha ao obter dados do Verdão.',
      detail: err.message,
      mode: getDataMode(),
    })
  }
})

app.get('/api/refresh', async (_req, res) => {
  try {
    const data = await buildHubData({ forceRefresh: true })
    res.json({ ok: true, mode: data.mode, fetchedAt: data.fetchedAt })
  } catch (err) {
    res.status(502).json({ ok: false, message: err.message })
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
  console.log(`🌿 Palmeiras Hub API em http://localhost:${PORT}`)
  console.log(`   Modo de dados: ${getDataMode()}`)
  if (isProd) console.log('   Servindo build estático (dist/)')
})
