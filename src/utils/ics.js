/**
 * Gera .ics válido (RFC 5545) para jogos do Palmeiras.
 * Download via Blob — compatível com Google Calendar / Apple / Outlook.
 */

import { matchTitle } from './format.js'

const PRODID = '-//Palmeiras Hub//PT-BR//EN'
const TZ = 'America/Sao_Paulo'

/** UTC compact: YYYYMMDDTHHMMSSZ */
export function toIcsUtc(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const p = (n) => String(n).padStart(2, '0')
  return (
    `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
    `T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
  )
}

function escapeIcs(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function foldLine(line) {
  // Soft fold at 75 octets (approx chars for ASCII)
  if (line.length <= 74) return line
  const parts = []
  let rest = line
  parts.push(rest.slice(0, 74))
  rest = rest.slice(74)
  while (rest.length) {
    parts.push(' ' + rest.slice(0, 73))
    rest = rest.slice(73)
  }
  return parts.join('\r\n')
}

function matchDurationMs(_match) {
  // Futebol ~2h (inclui intervalo); não inventamos horário real de término
  return 2 * 60 * 60 * 1000
}

/**
 * @param {object} match
 * @returns {string|null} VEVENT block (sem envelope)
 */
export function matchToVEvent(match) {
  if (!match?.date) return null
  const dtStart = toIcsUtc(match.date)
  if (!dtStart) return null
  const end = new Date(new Date(match.date).getTime() + matchDurationMs(match))
  const dtEnd = toIcsUtc(end.toISOString())
  const stamp = toIcsUtc(new Date().toISOString())
  const uid = `palmeiras-hub-${String(match.id || match.espnEventId || dtStart).replace(/[^\w.-]/g, '')}@palmeiras-hub`
  const summary = matchTitle(match) || `Palmeiras × ${match.opponent || 'adversário'}`
  const location = match.venue && match.venue !== 'A definir' ? match.venue : ''
  const descParts = [
    match.competition || '',
    match.isHome != null ? (match.isHome ? 'Casa' : 'Fora') : '',
    'Palmeiras Hub — https://guilhermeromio-netto-prog.github.io/palmeiras-hub/',
  ].filter(Boolean)

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcs(summary)}`,
    location ? `LOCATION:${escapeIcs(location)}` : null,
    `DESCRIPTION:${escapeIcs(descParts.join(' · '))}`,
    `CATEGORIES:${escapeIcs(match.competition || 'Futebol')}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
  ].filter(Boolean)

  return lines.map(foldLine).join('\r\n')
}

/**
 * @param {object|object[]} matches
 * @returns {string}
 */
export function buildIcsCalendar(matches) {
  const list = (Array.isArray(matches) ? matches : [matches]).filter(Boolean)
  const events = list.map(matchToVEvent).filter(Boolean)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Palmeiras Hub`,
    `X-WR-TIMEZONE:${TZ}`,
    ...events,
    'END:VCALENDAR',
  ]
  return lines.join('\r\n') + '\r\n'
}

export function downloadIcs(filename, icsText) {
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'palmeiras.ics'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function downloadMatchIcs(match) {
  if (!match) return false
  const ics = buildIcsCalendar(match)
  const day = (match.date || '').slice(0, 10) || 'jogo'
  const opp = String(match.opponent || 'adversario')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  downloadIcs(`palmeiras-${day}-${opp || 'jogo'}.ics`, ics)
  return true
}

export function downloadUpcomingIcs(matches) {
  const list = (matches || []).filter((m) => m && m.status !== 'FINISHED')
  if (!list.length) return false
  downloadIcs('palmeiras-proximos-jogos.ics', buildIcsCalendar(list))
  return true
}
