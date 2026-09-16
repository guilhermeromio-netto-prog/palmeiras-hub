/**
 * Client busca dados frescos a cada start do app (/api/hub?refresh=1).
 * Cache curto vive só no servidor; o front sempre revalida ao montar.
 */

export async function fetchHub({ signal } = {}) {
  const res = await fetch('/api/hub?refresh=1', {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body.detail || body.message || detail
    } catch {
      /* ignore */
    }
    throw new Error(detail)
  }
  return res.json()
}
