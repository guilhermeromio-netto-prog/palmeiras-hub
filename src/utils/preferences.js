/**
 * Preferências do torcedor — localStorage por navegador/dispositivo.
 */

export const PREFS_KEY = 'palmeiras-hub-prefs-v1'
export const MAX_FAVORITES = 5

export const DEFAULT_PREFS = {
  defaultTab: 'home',
  fontSize: 'normal', // normal | large
  compactMode: false,
  favoritePlayerIds: [],
}

export function readPreferences() {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    const parsed = JSON.parse(raw)
    return normalizePrefs(parsed)
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function writePreferences(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(normalizePrefs(prefs)))
  } catch {
    /* quota / private mode */
  }
}

export function normalizePrefs(input) {
  const tab = ['home', 'calendar', 'team', 'torcida', 'tables', 'news'].includes(input?.defaultTab)
    ? input.defaultTab
    : 'home'
  const fontSize = input?.fontSize === 'large' ? 'large' : 'normal'
  const compactMode = Boolean(input?.compactMode)
  const ids = Array.isArray(input?.favoritePlayerIds)
    ? [...new Set(input.favoritePlayerIds.map(String))].slice(0, MAX_FAVORITES)
    : []
  return { defaultTab: tab, fontSize, compactMode, favoritePlayerIds: ids }
}

export function toggleFavoritePlayer(prefs, playerId) {
  const id = String(playerId)
  const set = new Set(prefs.favoritePlayerIds || [])
  if (set.has(id)) set.delete(id)
  else if (set.size < MAX_FAVORITES) set.add(id)
  return normalizePrefs({ ...prefs, favoritePlayerIds: [...set] })
}
