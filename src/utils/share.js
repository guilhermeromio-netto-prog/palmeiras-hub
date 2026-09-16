/** URL canônica do GitHub Pages */
export const SITE_URL = 'https://guilhermeromio-netto-prog.github.io/palmeiras-hub/'

export async function shareOrWhatsApp(text) {
  const payload = text.trim()
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text: payload, url: SITE_URL, title: 'Palmeiras Hub' })
      return 'native'
    } catch (err) {
      if (err?.name === 'AbortError') return 'aborted'
      // cai no WhatsApp
    }
  }
  const url = `https://wa.me/?text=${encodeURIComponent(payload)}`
  window.open(url, '_blank', 'noopener,noreferrer')
  return 'whatsapp'
}

export function nextMatchShareText(match, { formatDateTime, matchTitle }) {
  if (!match) return `Avanti Palestra! 🌿 Acompanhe o Palmeiras Hub:\n${SITE_URL}`
  const when = formatDateTime(match.date)
  const title = matchTitle(match)
  const where = match.venue && match.venue !== 'A definir' ? `\n📍 ${match.venue}` : ''
  return (
    `🌿 Próximo jogo do Verdão!\n` +
    `${title}\n` +
    `🏆 ${match.competition}\n` +
    `🗓️ ${when} (SP)${where}\n\n` +
    `Acompanhe no Palmeiras Hub:\n${SITE_URL}`
  )
}

export function newsShareText(item) {
  const title = item?.title || 'Notícia do Verdão'
  const link = item?.url || SITE_URL
  return `📰 ${title}\n\n${link}\n\nVia Palmeiras Hub:\n${SITE_URL}`
}

export function resultShareText(match, { formatDate, matchTitle, scoreLine }) {
  if (!match) return `Resultados do Verdão no Palmeiras Hub:\n${SITE_URL}`
  const score = scoreLine(match) || 'placar indisponível'
  const resultWord =
    match.result === 'W' ? 'Vitória' : match.result === 'D' ? 'Empate' : match.result === 'L' ? 'Derrota' : 'Resultado'
  return (
    `🌿 ${resultWord}!\n` +
    `${matchTitle(match)}\n` +
    `⚽ ${score}\n` +
    `🏆 ${match.competition} · ${formatDate(match.date)}\n\n` +
    `Mais no Palmeiras Hub:\n${SITE_URL}`
  )
}
