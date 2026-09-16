/** Fetch JSON with timeout. Never invents data on failure. */
export async function fetchJson(url, { signal, timeoutMs = 14000, headers } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  const onAbort = () => ctrl.abort()
  if (signal) {
    if (signal.aborted) ctrl.abort()
    else signal.addEventListener('abort', onAbort, { once: true })
  }
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json', ...headers },
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status}${text ? `: ${text.slice(0, 80)}` : ''}`)
    }
    return await res.json()
  } finally {
    clearTimeout(timer)
    if (signal) signal.removeEventListener('abort', onAbort)
  }
}

export async function fetchText(url, { signal, timeoutMs = 14000, headers } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  const onAbort = () => ctrl.abort()
  if (signal) {
    if (signal.aborted) ctrl.abort()
    else signal.addEventListener('abort', onAbort, { once: true })
  }
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
    if (signal) signal.removeEventListener('abort', onAbort)
  }
}

/** Optional same-origin proxy when Express is running (npm run dev:proxy). */
export function viaProxy(url) {
  if (typeof window === 'undefined') return url
  const use = window.__PALMEIRAS_USE_PROXY__ === true
  if (!use) return url
  return `/api/proxy?url=${encodeURIComponent(url)}`
}
