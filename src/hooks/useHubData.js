import { useCallback, useEffect, useState } from 'react'
import { fetchHub } from '../api/client'

export function useHubData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const ctrl = new AbortController()
    try {
      const json = await fetchHub({ signal: ctrl.signal })
      setData(json)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Erro ao carregar dados')
        setData(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    let alive = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const json = await fetchHub({ signal: ctrl.signal })
        if (alive) setData(json)
      } catch (err) {
        if (alive && err.name !== 'AbortError') {
          setError(err.message || 'Erro ao carregar dados')
          setData(null)
        }
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
      ctrl.abort()
    }
  }, [])

  return { data, loading, error, reload: load }
}
