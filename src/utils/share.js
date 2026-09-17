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

export function reactionShareText(emoji, matchLabel) {
  const label = matchLabel || 'o Verdão'
  return (
    `🌿 Reagi com ${emoji} no Palmeiras Hub!\n` +
    `Jogo: ${label}\n` +
    `Mande sua reação também:\n${SITE_URL}`
  )
}

export function tipShareText(tip, matchLabel) {
  if (!tip) return `Palpite do Verdão no Palmeiras Hub:\n${SITE_URL}`
  const label = matchLabel || 'próximo jogo'
  return (
    `⚽ Meu palpite no Palmeiras Hub!\n` +
    `${label}\n` +
    `Placar: ${tip.home} × ${tip.away}\n\n` +
    `Faça o seu também:\n${SITE_URL}`
  )
}

export function muralInviteText(room = 'VERDAO') {
  const code = room || 'VERDAO'
  return (
    `💬 Entra no mural da torcida no Palmeiras Hub!\n` +
    `Abra o link e use a sala ${code} (igual a nossa).\n\n` +
    `${SITE_URL}`
  )
}

export function quizShareText(score, total) {
  return (
    `🧠 Quiz do Verdão — acertei ${score}/${total} no Palmeiras Hub!\n` +
    `Topa desafiar?\n${SITE_URL}`
  )
}

export function roomInviteText(room = 'VERDAO') {
  const code = room || 'VERDAO'
  return (
    `🌿 Entra no Palmeiras Hub comigo — sala ${code}\n` +
    `Jogos, placar, mural e torcida juntos.\n\n` +
    `Link: ${SITE_URL}\n` +
    `Código da sala: ${code}`
  )
}
