/**
 * Detecta vitória do Palmeiras a partir de placar verificado (home/away).
 * Só retorna true quando score está completo e o status é FT/FINISHED.
 */

function isPalmeirasName(name) {
  const n = String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
  return /palmeiras|verd[aã]o|palestra/i.test(n)
}

/**
 * @param {{ status?: string, score?: { home: number, away: number }, homeTeam?: string, awayTeam?: string, isHome?: boolean, result?: string } | null} match
 * @returns {boolean}
 */
export function didPalmeirasWin(match) {
  if (!match) return false
  const status = String(match.status || '').toUpperCase()
  const finished = status === 'FINISHED' || status === 'FT' || status === 'FINAL'
  if (!finished) return false

  // Prefer explicit result from hub when available
  if (match.result === 'W') return true
  if (match.result === 'L' || match.result === 'D') return false

  const score = match.score
  if (!score || score.home == null || score.away == null) return false
  const h = Number(score.home)
  const a = Number(score.away)
  if (!Number.isFinite(h) || !Number.isFinite(a)) return false

  if (typeof match.isHome === 'boolean') {
    return match.isHome ? h > a : a > h
  }

  const homeIsPal = isPalmeirasName(match.homeTeam)
  const awayIsPal = isPalmeirasName(match.awayTeam)
  if (homeIsPal && !awayIsPal) return h > a
  if (awayIsPal && !homeIsPal) return a > h
  return false
}
