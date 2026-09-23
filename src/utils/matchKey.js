/**
 * Chaves estáveis para deduplicar jogos entre ESPN schedule/scoreboard e TheSportsDB.
 * Nomes de adversário variam (ex.: "Liga de Quito" vs "LDU Quito").
 */

const TZ = 'America/Sao_Paulo'

export function dateDaySP(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function normalizeTeamName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/&/g, ' e ')
    .replace(/\b(s\.?e\.?|f\.?c\.?|c\.?f\.?|s\.?c\.?|a\.?c\.?|e\.?c\.?|c\.?a\.?|club|clube|de|da|do|dos|das|the|associação|associacao|sociedade|esportiva)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '')
}

/** Preferência: dia (SP) + competição + mando — robusto p/ hub do Palmeiras. */
export function matchDedupeKey(m) {
  if (!m) return ''
  const day = dateDaySP(m.date)
  const code = (m.competitionCode || inferCompetitionCode(m.competition) || 'OTH').toUpperCase()
  const side = m.isHome ? 'H' : 'A'
  return `${day}|${code}|${side}`
}

export function inferCompetitionCode(name) {
  const n = String(name || '')
  if (/libertadores/i.test(n)) return 'LIB'
  if (/copa do brasil|brazil cup/i.test(n)) return 'CDB'
  if (/paulista/i.test(n)) return 'PAU'
  if (/serie a|brasileir|brazil/i.test(n)) return 'BSA'
  return 'OTH'
}

/** Score de preferência ao fundir dois registros do mesmo jogo. */
export function matchFreshnessScore(m) {
  let s = 0
  if (m?.espnEventId) s += 8
  if (m?.score) s += 4
  if (m?.status === 'LIVE') s += 3
  if (m?.status === 'FINISHED') s += 2
  if (m?.id && !String(m.id).startsWith('tsdb-')) s += 2
  if (m?.venue && m.venue !== 'A definir') s += 1
  // Prefer dates that already carry Z / ±offset (avoids naive SportsDB drift)
  const ds = String(m?.date || '')
  if (/[zZ]$/.test(ds) || /[+-]\d{2}:?\d{2}$/.test(ds)) s += 2
  return s
}

/**
 * Funde listas de jogos sem duplicar o mesmo confronto.
 * @param {object[]} lists
 */
/**
 * Same opponent+competition+side within ~36h → keep one.
 * Prefers ESPN (espnEventId) and dates with explicit TZ.
 */
function isNearDuplicate(a, b) {
  if (!a || !b) return false
  const codeA = (a.competitionCode || inferCompetitionCode(a.competition) || 'OTH').toUpperCase()
  const codeB = (b.competitionCode || inferCompetitionCode(b.competition) || 'OTH').toUpperCase()
  if (codeA !== codeB) return false
  if (Boolean(a.isHome) !== Boolean(b.isHome)) return false
  const oppA = normalizeTeamName(a.opponent)
  const oppB = normalizeTeamName(b.opponent)
  if (!oppA || oppA !== oppB) return false
  const ta = new Date(a.date).getTime()
  const tb = new Date(b.date).getTime()
  if (!Number.isFinite(ta) || !Number.isFinite(tb)) return false
  return Math.abs(ta - tb) <= 36 * 60 * 60 * 1000
}

/** Second pass: collapse ±1 calendar day SP for same code+side+opponent. */
function collapseNearDuplicates(matches) {
  const sorted = [...matches].sort(
    (a, b) => matchFreshnessScore(b) - matchFreshnessScore(a) || new Date(a.date) - new Date(b.date),
  )
  const kept = []
  for (const m of sorted) {
    const idx = kept.findIndex((prev) => isNearDuplicate(prev, m))
    if (idx < 0) {
      kept.push(m)
      continue
    }
    const prev = kept[idx]
    if (matchFreshnessScore(m) > matchFreshnessScore(prev)) kept[idx] = m
  }
  return kept
}

export function mergeMatchesByKey(...lists) {
  const map = new Map()
  for (const list of lists) {
    for (const m of list || []) {
      if (!m?.date) continue
      const k = matchDedupeKey(m)
      if (!k.startsWith('|') && k.length > 4) {
        const prev = map.get(k)
        if (!prev || matchFreshnessScore(m) > matchFreshnessScore(prev)) {
          map.set(k, m)
        }
        continue
      }
      // fallback raro
      const fb = `${dateDaySP(m.date)}|${normalizeTeamName(m.opponent)}|${m.isHome ? 'H' : 'A'}`
      const prev = map.get(fb)
      if (!prev || matchFreshnessScore(m) > matchFreshnessScore(prev)) {
        map.set(fb, m)
      }
    }
  }
  // Collapse timezone drift: SportsDB naive Oct9 00:30 vs ESPN Oct8 21:30 SP
  return collapseNearDuplicates([...map.values()])
}

/**
 * Dedupe H2H meetings across ESPN/TheSportsDB timezone drift.
 * Collapses same score+teams within ±2 days, or same competition+score+teams.
 */
function scorePair(m) {
  if (!m?.score) return ''
  const h = m.score.home
  const a = m.score.away
  if (h == null || a == null) return ''
  return `${h}-${a}`
}

function teamsPair(m) {
  const home = normalizeTeamName(m.homeTeam || (m.isHome ? 'Palmeiras' : m.opponent))
  const away = normalizeTeamName(m.awayTeam || (m.isHome ? m.opponent : 'Palmeiras'))
  return `${home}|${away}`
}

function dayStamp(iso) {
  const d = dateDaySP(iso)
  if (!d) return NaN
  return Date.parse(`${d}T12:00:00Z`)
}

export function isSameH2HMeeting(a, b) {
  if (!a || !b) return false
  const score = scorePair(a)
  const teams = teamsPair(a)
  if (!score || !teams) return false
  if (score !== scorePair(b) || teams !== teamsPair(b)) return false

  const codeA = (a.competitionCode || inferCompetitionCode(a.competition) || '').toUpperCase()
  const codeB = (b.competitionCode || inferCompetitionCode(b.competition) || '').toUpperCase()
  if (codeA && codeB && codeA === codeB) return true

  const ta = dayStamp(a.date)
  const tb = dayStamp(b.date)
  if (!Number.isFinite(ta) || !Number.isFinite(tb)) return false
  const dayDiff = Math.abs(ta - tb) / 86400000
  return dayDiff <= 2
}

/** Keep newest unique meetings (already sorted or will be sorted by caller). */
export function dedupeH2HMeetings(meetings) {
  const sorted = [...(meetings || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
  const kept = []
  for (const m of sorted) {
    if (kept.some((prev) => isSameH2HMeeting(prev, m))) continue
    kept.push(m)
  }
  return kept
}

