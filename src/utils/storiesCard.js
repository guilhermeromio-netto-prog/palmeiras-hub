/**
 * Gera cartão Stories 9:16 (PNG) — próximo jogo ou último resultado.
 * Branding inspirado (brasão do hub em /public), sem marca oficial SEP.
 */
import { resolveTeamLogo } from '../data/teamLogos.js'
import { SITE_URL } from './share.js'

const W = 1080
const H = 1920

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null)
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function drawCover(ctx, img, x, y, size) {
  if (!img) return
  const s = Math.min(img.width, img.height)
  const sx = (img.width - s) / 2
  const sy = (img.height - s) / 2
  ctx.drawImage(img, sx, sy, s, s, x, y, size, size)
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text || '').split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

/**
 * @param {object} opts
 * @param {'next'|'result'} opts.mode
 * @param {object} opts.match
 * @param {string} [opts.kickoffLabel]
 * @param {string} [opts.scoreLabel]
 * @param {string[]} [opts.channels]
 * @param {string} [opts.crestUrl] absolute or same-origin crest
 * @returns {Promise<Blob|null>}
 */
export async function renderStoriesCard({
  mode = 'next',
  match,
  kickoffLabel = '',
  scoreLabel = '',
  channels = [],
  crestUrl,
}) {
  if (!match || typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Background gradient
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#003d24')
  g.addColorStop(0.45, '#006437')
  g.addColorStop(1, '#001a10')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // Soft pitch lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 3
  for (let i = 0; i < 8; i++) {
    const y = 280 + i * 180
    ctx.beginPath()
    ctx.moveTo(80, y)
    ctx.lineTo(W - 80, y)
    ctx.stroke()
  }

  // Top badge
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  roundRect(ctx, W / 2 - 220, 72, 440, 64, 32)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = '700 32px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(mode === 'result' ? 'RESULTADO' : 'PRÓXIMO JOGO', W / 2, 116)

  // Crest / hero
  const crest = await loadImage(crestUrl)
  if (crest) {
    drawCover(ctx, crest, W / 2 - 70, 160, 140)
  } else {
    ctx.fillStyle = '#fff'
    ctx.font = '800 48px system-ui, sans-serif'
    ctx.fillText('🌿', W / 2, 250)
  }

  ctx.fillStyle = '#e8ffe8'
  ctx.font = '800 52px system-ui, -apple-system, sans-serif'
  ctx.fillText('Palmeiras Hub', W / 2, 360)
  ctx.font = '600 28px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.fillText('Avanti Palestra', W / 2, 410)

  // Competition pill
  const comp = match.competition || 'Futebol'
  ctx.fillStyle = 'rgba(255,215,0,0.18)'
  roundRect(ctx, W / 2 - 280, 450, 560, 56, 28)
  ctx.fill()
  ctx.fillStyle = '#ffe566'
  ctx.font = '700 28px system-ui, sans-serif'
  const compLines = wrapText(ctx, comp, 520)
  ctx.fillText(compLines[0] || comp, W / 2, 488)

  // Team logos row
  const homeName = match.homeTeam || (match.isHome ? 'Palmeiras' : match.opponent)
  const awayName = match.awayTeam || (match.isHome ? match.opponent : 'Palmeiras')
  const homeLogo = resolveTeamLogo({
    name: homeName,
    espnId: match.homeEspnId || match.homeTeamId,
    logoUrl: match.homeLogoUrl || match.homeLogo,
  })
  const awayLogo = resolveTeamLogo({
    name: awayName,
    espnId: match.awayEspnId || match.awayTeamId,
    logoUrl: match.awayLogoUrl || match.awayLogo,
  })

  const [homeImg, awayImg] = await Promise.all([
    loadImage(homeLogo.url),
    loadImage(awayLogo.url),
  ])

  const logoY = 580
  const logoSize = 200
  // home
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  roundRect(ctx, 140, logoY, logoSize + 40, logoSize + 40, 28)
  ctx.fill()
  if (homeImg) {
    drawCover(ctx, homeImg, 160, logoY + 20, logoSize)
  } else {
    ctx.fillStyle = '#fff'
    ctx.font = '800 64px system-ui, sans-serif'
    ctx.fillText(homeLogo.initials || '?', 160 + logoSize / 2, logoY + 20 + logoSize / 2 + 20)
  }
  // away
  roundRect(ctx, W - 140 - logoSize - 40, logoY, logoSize + 40, logoSize + 40, 28)
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.fill()
  if (awayImg) {
    drawCover(ctx, awayImg, W - 140 - logoSize - 20, logoY + 20, logoSize)
  } else {
    ctx.fillStyle = '#fff'
    ctx.font = '800 64px system-ui, sans-serif'
    ctx.fillText(
      awayLogo.initials || '?',
      W - 140 - logoSize - 20 + logoSize / 2,
      logoY + 20 + logoSize / 2 + 20
    )
  }

  // VS / score
  ctx.fillStyle = '#fff'
  ctx.font = '800 72px system-ui, sans-serif'
  if (mode === 'result' && scoreLabel) {
    ctx.fillText(scoreLabel, W / 2, logoY + logoSize / 2 + 40)
  } else {
    ctx.fillText('×', W / 2, logoY + logoSize / 2 + 40)
  }

  // Team names
  ctx.font = '700 36px system-ui, sans-serif'
  ctx.fillStyle = '#fff'
  const nameY = logoY + logoSize + 100
  wrapText(ctx, homeName || '—', 360).slice(0, 2).forEach((ln, i) => {
    ctx.fillText(ln, 250, nameY + i * 42)
  })
  wrapText(ctx, awayName || '—', 360).slice(0, 2).forEach((ln, i) => {
    ctx.fillText(ln, W - 250, nameY + i * 42)
  })

  // Kickoff / meta card
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  roundRect(ctx, 100, 1080, W - 200, 420, 36)
  ctx.fill()

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '600 26px system-ui, sans-serif'
  ctx.fillText(mode === 'result' ? 'Placar final' : 'Horário (SP)', W / 2, 1140)

  ctx.fillStyle = '#fff'
  ctx.font = '800 44px system-ui, sans-serif'
  const mainLabel =
    mode === 'result'
      ? scoreLabel || '—'
      : kickoffLabel || 'A definir'
  wrapText(ctx, mainLabel, W - 280).slice(0, 2).forEach((ln, i) => {
    ctx.fillText(ln, W / 2, 1210 + i * 52)
  })

  if (match.venue && match.venue !== 'A definir') {
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.font = '600 28px system-ui, sans-serif'
    ctx.fillText(`📍 ${match.venue}`.slice(0, 48), W / 2, 1330)
  }

  if (channels?.length) {
    ctx.fillStyle = '#b8ffc8'
    ctx.font = '700 28px system-ui, sans-serif'
    ctx.fillText('📺 Onde assistir', W / 2, 1400)
    ctx.fillStyle = '#fff'
    ctx.font = '600 30px system-ui, sans-serif'
    ctx.fillText(channels.slice(0, 3).join(' · '), W / 2, 1450)
  }

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '500 24px system-ui, sans-serif'
  ctx.fillText('guilhermeromio-netto-prog.github.io/palmeiras-hub', W / 2, H - 80)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '400 20px system-ui, sans-serif'
  ctx.fillText('Hub de torcedor · não oficial', W / 2, H - 40)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

export async function shareStoriesBlob(blob, text) {
  if (!blob) return 'none'
  const file = new File([blob], 'palmeiras-hub-stories.png', { type: 'image/png' })
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: 'Palmeiras Hub',
        text: text || 'Avanti!',
        url: SITE_URL,
      })
      return 'native'
    } catch (err) {
      if (err?.name === 'AbortError') return 'aborted'
    }
  }
  // Fallback: download + WhatsApp text
  downloadBlob(blob, 'palmeiras-hub-stories.png')
  if (text) {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    return 'whatsapp+download'
  }
  return 'download'
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'palmeiras-hub-stories.png'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2500)
}
