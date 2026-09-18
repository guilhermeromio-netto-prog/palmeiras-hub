/**
 * Preferências do torcedor — localStorage por navegador/dispositivo.
 */

export const PREFS_KEY = 'palmeiras-hub-prefs-v1'
export const MAX_FAVORITES = 5

/** Bump when Home defaults change so existing installs get lean layout once. */
export const HOME_LAYOUT_VERSION = 430

/** Tema do torcedor: ênfase na tricolor Palmeiras */
export const THEME_ACCENTS = [
  { id: 'verde', label: 'Verde' },
  { id: 'branco', label: 'Branco' },
  { id: 'vermelho', label: 'Vermelho' },
]

/**
 * Blocos personalizáveis da Home (ordem padrão: Pro lean).
 * id estável; label só para a UI de preferências.
 */
export const HOME_BLOCK_DEFS = [
  { id: 'nextMatch', label: 'Dossiê do jogo (Pro)' },
  { id: 'seasonPanel', label: 'Painel da temporada (Pro)' },
  { id: 'torcidaCta', label: 'Torcida (CTA)' },
  { id: 'countdown', label: 'Countdown' },
  { id: 'weather', label: 'Clima' },
  { id: 'broadcast', label: 'Onde assistir' },
  { id: 'radio', label: 'Rádio' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'h2h', label: 'H2H completo' },
  { id: 'stats', label: 'Atalhos rápidos' },
  { id: 'recent', label: 'Resultados recentes' },
]

/** Ocultos por padrão — dossiê / painel / mídia no dossiê já cobrem. */
const DEFAULT_HIDDEN = new Set([
  'countdown',
  'weather',
  'broadcast',
  'radio',
  'youtube',
  'h2h',
  'stats',
  'recent',
])

export const DEFAULT_HOME_BLOCKS = HOME_BLOCK_DEFS.map((b) => ({
  id: b.id,
  visible: !DEFAULT_HIDDEN.has(b.id),
}))

export const STADIUM_MODES = [
  { id: 'auto', label: 'Automático' },
  { id: 'on', label: 'Sempre ligado' },
  { id: 'off', label: 'Desligado' },
]

export const DEFAULT_PREFS = {
  defaultTab: 'home',
  fontSize: 'normal', // normal | large
  compactMode: true, // Layout Pro compacto por padrão (v4.3)
  favoritePlayerIds: [],
  themeAccent: 'verde', // verde | branco | vermelho
  stadiumMode: 'auto', // auto | on | off — ambiência de estádio
  homeBlocks: DEFAULT_HOME_BLOCKS.map((b) => ({ ...b })),
  homeLayoutVersion: HOME_LAYOUT_VERSION,
}

export function readPreferences() {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) {
      return {
        ...DEFAULT_PREFS,
        homeBlocks: DEFAULT_HOME_BLOCKS.map((b) => ({ ...b })),
      }
    }
    const parsed = JSON.parse(raw)
    return normalizePrefs(parsed)
  } catch {
    return {
      ...DEFAULT_PREFS,
      homeBlocks: DEFAULT_HOME_BLOCKS.map((b) => ({ ...b })),
    }
  }
}

export function writePreferences(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(normalizePrefs(prefs)))
  } catch {
    /* quota / private mode */
  }
}

function normalizeHomeBlocks(input, { forceLean = false } = {}) {
  if (forceLean) {
    return DEFAULT_HOME_BLOCKS.map((b) => ({ ...b }))
  }
  const fromSaved = []
  if (Array.isArray(input)) {
    for (const item of input) {
      const id = item?.id
      if (!HOME_BLOCK_DEFS.some((d) => d.id === id)) continue
      if (fromSaved.some((b) => b.id === id)) continue
      fromSaved.push({ id, visible: item.visible !== false })
    }
  }
  for (const def of HOME_BLOCK_DEFS) {
    if (!fromSaved.some((b) => b.id === def.id)) {
      const defVisible = DEFAULT_HOME_BLOCKS.find((b) => b.id === def.id)?.visible !== false
      fromSaved.push({ id: def.id, visible: defVisible })
    }
  }
  return fromSaved
}

export function normalizePrefs(input) {
  const tab = ['home', 'calendar', 'team', 'torcida', 'tables', 'news'].includes(input?.defaultTab)
    ? input.defaultTab
    : 'home'
  const fontSize = input?.fontSize === 'large' ? 'large' : 'normal'
  const ids = Array.isArray(input?.favoritePlayerIds)
    ? [...new Set(input.favoritePlayerIds.map(String))].slice(0, MAX_FAVORITES)
    : []
  const themeAccent = THEME_ACCENTS.some((t) => t.id === input?.themeAccent)
    ? input.themeAccent
    : 'verde'
  const stadiumMode = STADIUM_MODES.some((m) => m.id === input?.stadiumMode)
    ? input.stadiumMode
    : 'auto'

  const savedLayout = Number(input?.homeLayoutVersion) || 0
  const needsLeanMigrate = savedLayout < HOME_LAYOUT_VERSION
  const homeBlocks = normalizeHomeBlocks(input?.homeBlocks, { forceLean: needsLeanMigrate })

  // v4.3: compact default; one-time migrate enables it; afterwards honor saved boolean
  const compactMode = needsLeanMigrate
    ? true
    : typeof input?.compactMode === 'boolean'
      ? input.compactMode
      : true

  return {
    defaultTab: tab,
    fontSize,
    compactMode,
    favoritePlayerIds: ids,
    themeAccent,
    stadiumMode,
    homeBlocks,
    homeLayoutVersion: HOME_LAYOUT_VERSION,
  }
}

/** Resolve se o modo estádio está ativo (match day SP + preferência). */
export function isStadiumModeActive(prefs, matchDay) {
  const mode = prefs?.stadiumMode || 'auto'
  if (mode === 'on') return true
  if (mode === 'off') return false
  return Boolean(matchDay)
}

export function toggleFavoritePlayer(prefs, playerId) {
  const id = String(playerId)
  const set = new Set(prefs.favoritePlayerIds || [])
  if (set.has(id)) set.delete(id)
  else if (set.size < MAX_FAVORITES) set.add(id)
  return normalizePrefs({ ...prefs, favoritePlayerIds: [...set] })
}

export function moveHomeBlock(prefs, blockId, direction) {
  const blocks = [...(prefs.homeBlocks || DEFAULT_HOME_BLOCKS)]
  const idx = blocks.findIndex((b) => b.id === blockId)
  if (idx < 0) return prefs
  const swap = direction === 'up' ? idx - 1 : idx + 1
  if (swap < 0 || swap >= blocks.length) return prefs
  ;[blocks[idx], blocks[swap]] = [blocks[swap], blocks[idx]]
  return normalizePrefs({ ...prefs, homeBlocks: blocks, homeLayoutVersion: HOME_LAYOUT_VERSION })
}

export function setHomeBlockVisible(prefs, blockId, visible) {
  const blocks = (prefs.homeBlocks || DEFAULT_HOME_BLOCKS).map((b) =>
    b.id === blockId ? { ...b, visible: Boolean(visible) } : b
  )
  return normalizePrefs({ ...prefs, homeBlocks: blocks, homeLayoutVersion: HOME_LAYOUT_VERSION })
}

export function homeBlockLabel(id) {
  return HOME_BLOCK_DEFS.find((d) => d.id === id)?.label || id
}

export function resetHomeBlocks(prefs) {
  return normalizePrefs({
    ...prefs,
    homeBlocks: DEFAULT_HOME_BLOCKS.map((b) => ({ ...b })),
    homeLayoutVersion: HOME_LAYOUT_VERSION,
  })
}
