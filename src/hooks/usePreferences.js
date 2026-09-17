import { useCallback, useEffect, useState } from 'react'
import {
  readPreferences,
  writePreferences,
  toggleFavoritePlayer as toggleFav,
  moveHomeBlock as moveBlock,
  setHomeBlockVisible as setBlockVisible,
  resetHomeBlocks as resetBlocks,
  DEFAULT_PREFS,
} from '../utils/preferences'

export function usePreferences() {
  const [prefs, setPrefs] = useState(() =>
    typeof localStorage !== 'undefined' ? readPreferences() : { ...DEFAULT_PREFS }
  )

  useEffect(() => {
    writePreferences(prefs)
    const root = document.documentElement
    root.dataset.fontSize = prefs.fontSize
    root.dataset.compact = prefs.compactMode ? '1' : '0'
    root.dataset.theme = prefs.themeAccent || 'verde'
  }, [prefs])

  const update = useCallback((patch) => {
    setPrefs((prev) => ({ ...prev, ...patch }))
  }, [])

  const toggleFavoritePlayer = useCallback((playerId) => {
    setPrefs((prev) => toggleFav(prev, playerId))
  }, [])

  const moveHomeBlock = useCallback((blockId, direction) => {
    setPrefs((prev) => moveBlock(prev, blockId, direction))
  }, [])

  const setHomeBlockVisible = useCallback((blockId, visible) => {
    setPrefs((prev) => setBlockVisible(prev, blockId, visible))
  }, [])

  const resetHomeBlocks = useCallback(() => {
    setPrefs((prev) => resetBlocks(prev))
  }, [])

  return {
    prefs,
    update,
    toggleFavoritePlayer,
    moveHomeBlock,
    setHomeBlockVisible,
    resetHomeBlocks,
    setPrefs,
  }
}
