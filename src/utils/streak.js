/**
 * Sequência diária da torcida — local sempre funciona;
 * InstantDB é best-effort (não inventa multi-device se falhar).
 */
import { dateKeySP } from './datetime.js'

const STREAK_KEY = 'palmeiras-hub-streak-v1'

function safeParse(raw) {
  try {
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function yesterdayKey(todayKey) {
  // todayKey is YYYY-MM-DD in SP; subtract one calendar day in SP by parsing as noon UTC-ish
  const [y, m, d] = todayKey.split('-').map(Number)
  // Create a date at noon UTC that maps safely, then subtract 24h and re-key in SP
  const approx = new Date(Date.UTC(y, m - 1, d, 15, 0, 0)) // ~12:00 SP-ish
  approx.setUTCDate(approx.getUTCDate() - 1)
  return dateKeySP(approx)
}

export function readStreak() {
  const data = safeParse(
    typeof localStorage !== 'undefined' ? localStorage.getItem(STREAK_KEY) : null
  )
  if (!data || typeof data !== 'object') {
    return { count: 0, lastDate: null, name: '' }
  }
  return {
    count: Math.max(0, Number(data.count) || 0),
    lastDate: data.lastDate || null,
    name: String(data.name || '').slice(0, 20),
  }
}

/**
 * Registra check-in do dia. Idempotente no mesmo dia.
 * @returns {{ count: number, lastDate: string, name: string, isNewDay: boolean }}
 */
export function registerDailyCheckIn(displayName = '') {
  const today = dateKeySP(new Date())
  if (!today) {
    return { ...readStreak(), isNewDay: false }
  }
  const prev = readStreak()
  const name = String(displayName || prev.name || '').trim().slice(0, 20)

  if (prev.lastDate === today) {
    const next = { count: prev.count || 1, lastDate: today, name: name || prev.name }
    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify(next))
    } catch {
      /* */
    }
    return { ...next, isNewDay: false }
  }

  const yKey = yesterdayKey(today)
  const continued = prev.lastDate === yKey && prev.count > 0
  const count = continued ? prev.count + 1 : 1
  const next = { count, lastDate: today, name }
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(next))
  } catch {
    /* */
  }
  return { ...next, isNewDay: true }
}

export function streakLabel(count) {
  const n = Number(count) || 0
  if (n <= 0) return null
  if (n === 1) return '🔥 1 dia seguido'
  return `🔥 ${n} dias seguidos`
}
