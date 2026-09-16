/**
 * Setas de movimento na tabela.
 * 1) Preferência: ESPN `rankChange` (≠ 0).
 * 2) Fallback: delta vs snapshot da visita anterior em localStorage.
 */

const STORAGE_KEY = 'palmeiras-hub-standings-snapshot-v1'

function readSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeSnapshot(snapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    /* quota / private mode */
  }
}

function teamKey(competitionCode, group, team) {
  return `${competitionCode || 'X'}|${group || 'main'}|${String(team || '').toLowerCase()}`
}

/**
 * Enriquece cada linha com `movement` (+ sobe, − desce, 0 estável) e `movementSource`.
 * Também persiste o snapshot atual para a próxima visita.
 */
export function applyStandingsMovement(competitions) {
  if (typeof localStorage === 'undefined') {
    return (competitions || []).map((c) => ({
      ...c,
      table: (c.table || []).map((row) => annotateRow(row, row.rankChange || 0, 'espn')),
    }))
  }

  const prev = readSnapshot()
  const next = {}
  const out = (competitions || []).map((c) => {
    const table = (c.table || []).map((row) => {
      const key = teamKey(c.competitionCode, c.group, row.team)
      next[key] = row.position

      const espnDelta =
        row.rankChange != null && Number.isFinite(Number(row.rankChange))
          ? Number(row.rankChange)
          : null

      if (espnDelta != null && espnDelta !== 0) {
        return annotateRow(row, espnDelta, 'espn')
      }

      if (prev[key] != null && Number.isFinite(Number(prev[key]))) {
        const delta = Number(prev[key]) - Number(row.position)
        return annotateRow(row, delta, 'localStorage')
      }

      return annotateRow(row, espnDelta === 0 ? 0 : 0, espnDelta === 0 ? 'espn' : 'none')
    })
    return { ...c, table }
  })

  writeSnapshot(next)
  return out
}

function annotateRow(row, movement, source) {
  return {
    ...row,
    movement: Number(movement) || 0,
    movementSource: source,
  }
}

export function movementGlyph(movement) {
  const n = Number(movement) || 0
  if (n > 0) return { symbol: '↑', label: `Subiu ${n}`, tone: 'up' }
  if (n < 0) return { symbol: '↓', label: `Desceu ${Math.abs(n)}`, tone: 'down' }
  return { symbol: '→', label: 'Estável', tone: 'same' }
}
