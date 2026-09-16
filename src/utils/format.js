const TZ = 'America/Sao_Paulo'

export function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatRelative(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `há ${mins} min`
  const hours = Math.round(mins / 60)
  if (hours < 48) return `há ${hours} h`
  const days = Math.round(hours / 24)
  return `há ${days} d`
}

export function scoreLine(match) {
  if (!match?.score) return null
  return `${match.score.home} × ${match.score.away}`
}

export function matchTitle(match) {
  if (!match) return ''
  if (match.homeTeam && match.awayTeam) {
    return `${match.homeTeam} × ${match.awayTeam}`
  }
  return match.isHome ? `Palmeiras × ${match.opponent}` : `${match.opponent} × Palmeiras`
}
