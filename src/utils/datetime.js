export const TZ = 'America/Sao_Paulo'

/** Chave YYYY-MM-DD no fuso America/Sao_Paulo */
export function dateKeySP(input = new Date()) {
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function isTodaySP(iso) {
  const key = dateKeySP(iso)
  return key != null && key === dateKeySP(new Date())
}

export function msUntil(iso) {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  return t - Date.now()
}

/** Partes positivas do countdown (zera se já passou) */
export function countdownParts(iso) {
  const ms = msUntil(iso)
  if (ms == null) return null
  const clamped = Math.max(0, ms)
  const totalSec = Math.floor(clamped / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60
  return { days, hours, mins, secs, totalMs: ms, past: ms <= 0 }
}

/** Há jogo do Palmeiras no dia local SP? */
export function isMatchDaySP(data) {
  const today = dateKeySP(new Date())
  if (!today) return false
  const pool = []
  if (data?.nextMatch) pool.push(data.nextMatch)
  for (const m of data?.upcoming || []) pool.push(m)
  for (const m of data?.recentResults || []) {
    if (dateKeySP(m.date) === today) pool.push(m)
  }
  return pool.some((m) => dateKeySP(m.date) === today)
}
