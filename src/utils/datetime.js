export const TZ = 'America/Sao_Paulo'

/**
 * Normalize a source timestamp into an ISO-8601 instant string Date can parse
 * unambiguously (with Z or numeric offset).
 *
 * - Already has Z or ±HH:MM → trim / space→T, keep offset
 * - Naive + assume:'utc' → append Z (ESPN-style UTC digits)
 * - Naive + assume:'america-sao-paulo' → append -03:00 (SportsDB Brazil wall clock; no DST)
 *
 * @param {string|null|undefined} raw
 * @param {{ assume?: 'utc' | 'america-sao-paulo' }} [opts]
 * @returns {string|null}
 */
export function normalizeToIsoInstant(raw, { assume } = {}) {
  if (raw == null) return null
  let s = String(raw).trim()
  if (!s) return null

  // "2026-10-09 00:30:00Z" / "2026-10-09 00:30:00" → T
  s = s.replace(' ', 'T')

  // Already an instant with Z or numeric offset (±HH:MM or ±HHMM)
  if (/[zZ]$/.test(s) || /[+-]\d{2}:?\d{2}$/.test(s)) {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? null : s
  }

  // Date-only YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    if (assume === 'utc') s = `${s}T00:00:00Z`
    else if (assume === 'america-sao-paulo') s = `${s}T00:00:00-03:00`
    else return null
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(s)) {
    // Naive datetime — pad seconds if missing
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) s = `${s}:00`
    if (assume === 'utc') s = `${s}Z`
    else if (assume === 'america-sao-paulo') s = `${s}-03:00`
    else return null
  } else {
    return null
  }

  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : s
}

/** True when the ISO string carries an explicit timezone (Z or ±offset). */
export function hasExplicitTz(iso) {
  if (!iso) return false
  const s = String(iso).trim()
  return /[zZ]$/.test(s) || /[+-]\d{2}:?\d{2}$/.test(s)
}

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
