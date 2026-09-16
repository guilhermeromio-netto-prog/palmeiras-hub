import { useCallback, useEffect, useState } from 'react'
import {
  readPreferences,
  writePreferences,
  toggleFavoritePlayer as toggleFav,
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
  }, [prefs])

  const update = useCallback((patch) => {
    setPrefs((prev) => ({ ...prev, ...patch }))
  }, [])

  const toggleFavoritePlayer = useCallback((playerId) => {
    setPrefs((prev) => toggleFav(prev, playerId))
  }, [])

  return { prefs, update, toggleFavoritePlayer, setPrefs }
}
