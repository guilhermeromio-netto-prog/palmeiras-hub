/**
 * Mapeia formationPlace (ESPN 1–11) + string de formação → coordenadas % no gramado.
 * Ataque para cima (y pequeno = frente).
 */

const LAYOUTS = {
  '4-2-3-1': {
    1: { x: 50, y: 90 },
    2: { x: 86, y: 72 },
    3: { x: 14, y: 72 },
    5: { x: 64, y: 72 },
    6: { x: 36, y: 72 },
    4: { x: 36, y: 52 },
    8: { x: 64, y: 52 },
    7: { x: 86, y: 32 },
    10: { x: 50, y: 32 },
    11: { x: 14, y: 32 },
    9: { x: 50, y: 12 },
  },
  '4-3-3': {
    1: { x: 50, y: 90 },
    2: { x: 86, y: 72 },
    3: { x: 14, y: 72 },
    5: { x: 64, y: 72 },
    6: { x: 36, y: 72 },
    4: { x: 50, y: 55 },
    8: { x: 72, y: 48 },
    7: { x: 28, y: 48 },
    11: { x: 14, y: 22 },
    9: { x: 50, y: 14 },
    10: { x: 86, y: 22 },
  },
  '4-4-2': {
    1: { x: 50, y: 90 },
    2: { x: 86, y: 72 },
    3: { x: 14, y: 72 },
    5: { x: 64, y: 72 },
    6: { x: 36, y: 72 },
    7: { x: 86, y: 48 },
    4: { x: 36, y: 48 },
    8: { x: 64, y: 48 },
    11: { x: 14, y: 48 },
    9: { x: 38, y: 16 },
    10: { x: 62, y: 16 },
  },
  '4-1-4-1': {
    1: { x: 50, y: 90 },
    2: { x: 86, y: 72 },
    3: { x: 14, y: 72 },
    5: { x: 64, y: 72 },
    6: { x: 36, y: 72 },
    4: { x: 50, y: 58 },
    7: { x: 86, y: 38 },
    8: { x: 64, y: 38 },
    10: { x: 36, y: 38 },
    11: { x: 14, y: 38 },
    9: { x: 50, y: 14 },
  },
  '3-5-2': {
    1: { x: 50, y: 90 },
    4: { x: 50, y: 74 },
    5: { x: 70, y: 74 },
    6: { x: 30, y: 74 },
    2: { x: 88, y: 52 },
    3: { x: 12, y: 52 },
    7: { x: 68, y: 48 },
    8: { x: 50, y: 50 },
    11: { x: 32, y: 48 },
    9: { x: 38, y: 16 },
    10: { x: 62, y: 16 },
  },
  '3-4-3': {
    1: { x: 50, y: 90 },
    4: { x: 50, y: 74 },
    5: { x: 70, y: 74 },
    6: { x: 30, y: 74 },
    2: { x: 88, y: 50 },
    3: { x: 12, y: 50 },
    7: { x: 64, y: 48 },
    8: { x: 36, y: 48 },
    9: { x: 50, y: 14 },
    10: { x: 82, y: 22 },
    11: { x: 18, y: 22 },
  },
  '5-3-2': {
    1: { x: 50, y: 90 },
    2: { x: 90, y: 70 },
    3: { x: 10, y: 70 },
    4: { x: 50, y: 72 },
    5: { x: 68, y: 72 },
    6: { x: 32, y: 72 },
    7: { x: 72, y: 46 },
    8: { x: 50, y: 48 },
    11: { x: 28, y: 46 },
    9: { x: 38, y: 16 },
    10: { x: 62, y: 16 },
  },

  '3-4-2-1': {
    1: { x: 50, y: 90 },
    4: { x: 28, y: 74 },
    5: { x: 50, y: 74 },
    6: { x: 72, y: 74 },
    3: { x: 12, y: 50 },
    8: { x: 38, y: 50 },
    7: { x: 62, y: 50 },
    2: { x: 88, y: 50 },
    11: { x: 32, y: 28 },
    10: { x: 68, y: 28 },
    9: { x: 50, y: 12 },
  },
  '3-4-1-2': {
    1: { x: 50, y: 90 },
    4: { x: 28, y: 74 },
    5: { x: 50, y: 74 },
    6: { x: 72, y: 74 },
    3: { x: 12, y: 50 },
    8: { x: 38, y: 50 },
    7: { x: 62, y: 50 },
    2: { x: 88, y: 50 },
    10: { x: 50, y: 32 },
    9: { x: 36, y: 14 },
    11: { x: 64, y: 14 },
  },
  '4-2-2-2': {
    1: { x: 50, y: 90 },
    2: { x: 86, y: 72 },
    3: { x: 14, y: 72 },
    5: { x: 64, y: 72 },
    6: { x: 36, y: 72 },
    4: { x: 36, y: 52 },
    8: { x: 64, y: 52 },
    7: { x: 68, y: 32 },
    11: { x: 32, y: 32 },
    9: { x: 38, y: 12 },
    10: { x: 62, y: 12 },
  },
  '4-5-1': {
    1: { x: 50, y: 90 },
    2: { x: 86, y: 72 },
    3: { x: 14, y: 72 },
    5: { x: 64, y: 72 },
    6: { x: 36, y: 72 },
    7: { x: 86, y: 42 },
    4: { x: 50, y: 48 },
    8: { x: 68, y: 42 },
    10: { x: 32, y: 42 },
    11: { x: 14, y: 42 },
    9: { x: 50, y: 14 },
  },
}

function normalizeFormation(f) {
  if (!f) return null
  return String(f).trim().replace(/[–—]/g, '-').replace(/\s+/g, '')
}

function fallbackByPosition(starters) {
  const rows = { G: [], D: [], M: [], F: [] }
  for (const p of starters) {
    const ab = (p.position || '').toUpperCase()
    if (ab.startsWith('G') || ab === 'GK') rows.G.push(p)
    else if (/CB|LB|RB|LWB|RWB|CD|WB|^D/.test(ab)) rows.D.push(p)
    else if (/ST|CF|FW|^F|AT/.test(ab)) rows.F.push(p)
    else rows.M.push(p)
  }
  // Ensure everyone placed
  const placed = new Set([...rows.G, ...rows.D, ...rows.M, ...rows.F])
  for (const p of starters) {
    if (!placed.has(p)) rows.M.push(p)
  }
  const out = []
  const placeRow = (list, y) => {
    const n = list.length || 1
    list.forEach((p, i) => {
      const x = ((i + 1) / (n + 1)) * 100
      out.push({ ...p, x, y })
    })
  }
  placeRow(rows.G, 90)
  placeRow(rows.D, 70)
  placeRow(rows.M, 42)
  placeRow(rows.F, 16)
  return out
}

/** @returns {Array<{...player, x:number, y:number}>} */
export function placeOnPitch(starters, formation) {
  if (!starters?.length) return []
  const key = normalizeFormation(formation)
  const layout = (key && LAYOUTS[key]) || LAYOUTS['4-2-3-1']

  const withPlace = starters.filter((p) => p.formationPlace && layout[p.formationPlace])
  if (withPlace.length >= 8) {
    return starters.map((p) => {
      const spot = p.formationPlace && layout[p.formationPlace]
      if (spot) return { ...p, x: spot.x, y: spot.y }
      return null
    }).filter(Boolean)
  }

  // Try alternate: if formation string unknown but places exist on 4-2-3-1
  if (starters.some((p) => p.formationPlace)) {
    const mapped = starters
      .map((p) => {
        const spot = p.formationPlace && LAYOUTS['4-2-3-1'][p.formationPlace]
        return spot ? { ...p, x: spot.x, y: spot.y } : null
      })
      .filter(Boolean)
    if (mapped.length >= 8) return mapped
  }

  return fallbackByPosition(starters)
}

export function formationLabel(formation) {
  const n = normalizeFormation(formation)
  return n || '—'
}
