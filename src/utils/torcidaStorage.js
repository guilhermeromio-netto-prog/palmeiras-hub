/**
 * Interações da torcida — só neste aparelho (localStorage).
 * Sem backend / sem API keys.
 */

const REACTIONS_KEY = 'palmeiras-hub-reactions-v1'
const TIPS_KEY = 'palmeiras-hub-tips-v1'
const MURAL_KEY = 'palmeiras-hub-mural-v1'
const QUIZ_KEY = 'palmeiras-hub-quiz-best-v1'
const CONFETTI_KEY = 'palmeiras-hub-confetti-seen-v1'

export const REACTION_EMOJIS = ['💚', '🔥', '⚪', '🏆', '🐷']

export const MAX_MURAL = 30
export const MAX_NAME = 20
export const MAX_MSG = 80

function safeParse(raw, fallback) {
  try {
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / private */
  }
}

/** @returns {Record<string, number>} */
export function getReactions(matchId) {
  const all = safeParse(localStorage.getItem(REACTIONS_KEY), {})
  const entry = all[String(matchId)] || {}
  const out = {}
  for (const e of REACTION_EMOJIS) out[e] = Number(entry[e]) || 0
  return out
}

export function addReaction(matchId, emoji) {
  if (!REACTION_EMOJIS.includes(emoji)) return getReactions(matchId)
  const all = safeParse(localStorage.getItem(REACTIONS_KEY), {})
  const id = String(matchId)
  const entry = { ...(all[id] || {}) }
  entry[emoji] = (Number(entry[emoji]) || 0) + 1
  all[id] = entry
  write(REACTIONS_KEY, all)
  return getReactions(matchId)
}

/** @returns {{ home: number, away: number, at: string } | null} */
export function getTip(matchId) {
  const all = safeParse(localStorage.getItem(TIPS_KEY), {})
  const tip = all[String(matchId)]
  if (!tip || tip.home == null || tip.away == null) return null
  return {
    home: Number(tip.home),
    away: Number(tip.away),
    at: tip.at || '',
  }
}

export function saveTip(matchId, home, away) {
  const h = Math.max(0, Math.min(15, Math.floor(Number(home))))
  const a = Math.max(0, Math.min(15, Math.floor(Number(away))))
  if (Number.isNaN(h) || Number.isNaN(a)) return null
  const all = safeParse(localStorage.getItem(TIPS_KEY), {})
  all[String(matchId)] = { home: h, away: a, at: new Date().toISOString() }
  write(TIPS_KEY, all)
  return getTip(matchId)
}

/**
 * Compara palpite com placar final (home/away do jogo, não Palmeiras/adversário).
 * @returns {'hit'|'miss'|'pending'}
 */
export function tipResult(tip, score) {
  if (!tip || !score || score.home == null || score.away == null) return 'pending'
  if (Number(tip.home) === Number(score.home) && Number(tip.away) === Number(score.away)) {
    return 'hit'
  }
  return 'miss'
}

/** @returns {{ id: string, name: string, message: string, at: string }[]} */
export function getMural() {
  const list = safeParse(localStorage.getItem(MURAL_KEY), [])
  if (!Array.isArray(list)) return []
  return list
    .filter((m) => m && typeof m.message === 'string')
    .slice(0, MAX_MURAL)
}

export function addMuralEntry(name, message) {
  const n = String(name || 'Torcedor').trim().slice(0, MAX_NAME) || 'Torcedor'
  const msg = String(message || '').trim().slice(0, MAX_MSG)
  if (!msg) return getMural()
  const list = getMural()
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: n,
    message: msg,
    at: new Date().toISOString(),
  }
  const next = [entry, ...list].slice(0, MAX_MURAL)
  write(MURAL_KEY, next)
  return next
}

export function getQuizBest() {
  const n = Number(localStorage.getItem(QUIZ_KEY))
  return Number.isFinite(n) ? n : null
}

export function saveQuizBest(score) {
  const prev = getQuizBest()
  const s = Number(score)
  if (!Number.isFinite(s)) return prev
  if (prev == null || s > prev) {
    try {
      localStorage.setItem(QUIZ_KEY, String(s))
    } catch {
      /* */
    }
    return s
  }
  return prev
}

/** Confetti só uma vez por match FT vitória neste aparelho */
export function confettiAlreadySeen(matchId) {
  const all = safeParse(localStorage.getItem(CONFETTI_KEY), {})
  return Boolean(all[String(matchId)])
}

export function markConfettiSeen(matchId) {
  const all = safeParse(localStorage.getItem(CONFETTI_KEY), {})
  all[String(matchId)] = true
  write(CONFETTI_KEY, all)
}

export function softHaptic(pattern = 12) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern)
    }
  } catch {
    /* unsupported */
  }
}
