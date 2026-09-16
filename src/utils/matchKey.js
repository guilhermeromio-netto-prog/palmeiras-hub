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
  return s
}

/**
 * Funde listas de jogos sem duplicar o mesmo confronto.
 * @param {object[]} lists
 */
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
  return [...map.values()]
}
